const fs = require('fs');
const path = require('path');

// Đọc dữ liệu từ file JSON
const getFaqData = () => {
  try {
    const faqPath = path.join(__dirname, '../data/faq_data.json');
    const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
    return faqData;
  } catch (error) {
    console.error('Lỗi khi đọc file FAQ:', error);
    return null;
  }
};

// Chuyển đổi chuỗi thành mảng các từ, loại bỏ từ ngừng và ký tự đặc biệt
const tokenizeText = (text) => {
  // Danh sách một số từ ngừng tiếng Việt
  const stopWords = ['là', 'của', 'và', 'các', 'có', 'không', 'được', 'để', 'trong', 'những', 'với', 'một', 'từ', 'cho'];
  
  // Chuyển text thành chữ thường và loại bỏ ký tự đặc biệt
  let words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ')
    .split(' ');
  
  // Loại bỏ từ ngừng
  words = words.filter(word => !stopWords.includes(word) && word.length > 1);
  
  return words;
};

// Tìm kiếm câu trả lời dựa trên từ khóa
const searchFaq = (query) => {
  const faqData = getFaqData();
  if (!faqData) return null;

  // Chuẩn hóa câu truy vấn
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = tokenizeText(normalizedQuery);
  
  // Không có từ khóa tìm kiếm hợp lệ
  if (queryWords.length === 0) return [];
  
  // Mảng kết quả tìm kiếm
  const searchResults = [];

  // Tìm kiếm trong tất cả các câu hỏi
  faqData.sections.forEach(section => {
    if (section.questions) {
      section.questions.forEach(questionObj => {
        const questionText = questionObj.question_text.toLowerCase();
        const answerText = questionObj.answer_text.toLowerCase();
        
        // Tính điểm liên quan
        const relevance = calculateRelevance(queryWords, questionText, answerText);
        
        // Chỉ thêm vào kết quả nếu có độ liên quan đủ cao (ít nhất 2 điểm)
        if (relevance >= 2) {
          searchResults.push({
            section: section.section_title,
            question: questionObj.question_text,
            answer: questionObj.answer_text,
            relevance: relevance
          });
        }
      });
    }
  });

  // Sắp xếp kết quả theo độ liên quan
  searchResults.sort((a, b) => b.relevance - a.relevance);
  
  return searchResults;
};

// Tính toán độ liên quan của kết quả
const calculateRelevance = (queryWords, question, answer) => {
  const questionWords = tokenizeText(question);
  const answerWords = tokenizeText(answer);
  
  let relevance = 0;
  
  // Kiểm tra mỗi từ trong câu truy vấn
  queryWords.forEach(queryWord => {
    // Từ xuất hiện trong câu hỏi có trọng số cao hơn
    if (questionWords.includes(queryWord)) {
      relevance += 3;
    }
    // Từ xuất hiện trong câu trả lời
    else if (answerWords.includes(queryWord)) {
      relevance += 1;
    }
    // Kiểm tra từng phần của câu hỏi để phát hiện từ gần giống
    else {
      // Kiểm tra nếu một phần của từ khóa xuất hiện trong câu hỏi
      for (const word of questionWords) {
        if (word.includes(queryWord) || queryWord.includes(word)) {
          if (Math.min(word.length, queryWord.length) >= 3) { // Đảm bảo từ đủ dài để có nghĩa
            relevance += 1;
            break;
          }
        }
      }
      
      // Tương tự cho câu trả lời
      for (const word of answerWords) {
        if (word.includes(queryWord) || queryWord.includes(word)) {
          if (Math.min(word.length, queryWord.length) >= 3) {
            relevance += 0.5;
            break;
          }
        }
      }
    }
  });
  
  // Cộng thêm điểm nếu cả câu truy vấn xuất hiện trong câu hỏi hoặc câu trả lời
  if (question.includes(queryWords.join(' '))) {
    relevance += 5;
  } else if (answer.includes(queryWords.join(' '))) {
    relevance += 3;
  }
  
  return relevance;
};

// Lấy câu trả lời phù hợp nhất từ kết quả tìm kiếm
const getBestAnswer = (query) => {
  const results = searchFaq(query);
  
  if (!results || results.length === 0) {
    return {
      found: false,
      message: "Em xin lỗi, em không tìm thấy thông tin về vấn đề anh/chị đang hỏi. Anh/chị có thể liên hệ trực tiếp với chúng tôi qua Hotline: 0839171005 hoặc Facebook: https://www.facebook.com/caPta1ntynn để được hỗ trợ tốt nhất."
    };
  }
  
  // Lấy kết quả đầu tiên (phù hợp nhất)
  const bestMatch = results[0];
  
  return {
    found: true,
    question: bestMatch.question,
    answer: bestMatch.answer,
    section: bestMatch.section
  };
};

// Lấy danh sách tất cả các câu hỏi
const getAllQuestions = () => {
  const faqData = getFaqData();
  if (!faqData) return [];
  
  const allQuestions = [];
  
  faqData.sections.forEach(section => {
    if (section.questions) {
      section.questions.forEach(questionObj => {
        allQuestions.push({
          section: section.section_title,
          question: questionObj.question_text,
          questionNumber: questionObj.question_number
        });
      });
    }
  });
  
  return allQuestions;
};

module.exports = {
  getFaqData,
  searchFaq,
  getBestAnswer,
  getAllQuestions
}; 