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

// Tìm kiếm câu trả lời dựa trên từ khóa
const searchFaq = (query) => {
  const faqData = getFaqData();
  if (!faqData) return null;

  // Chuẩn hóa câu truy vấn
  const normalizedQuery = query.toLowerCase().trim();
  
  // Mảng kết quả tìm kiếm
  const searchResults = [];

  // Tìm kiếm trong tất cả các câu hỏi
  faqData.sections.forEach(section => {
    if (section.questions) {
      section.questions.forEach(questionObj => {
        const questionText = questionObj.question_text.toLowerCase();
        const answerText = questionObj.answer_text.toLowerCase();
        
        // Kiểm tra nếu câu hỏi hoặc câu trả lời chứa từ khóa
        if (questionText.includes(normalizedQuery) || answerText.includes(normalizedQuery)) {
          searchResults.push({
            section: section.section_title,
            question: questionObj.question_text,
            answer: questionObj.answer_text,
            relevance: calculateRelevance(normalizedQuery, questionText, answerText)
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
const calculateRelevance = (query, question, answer) => {
  // Đếm số lần xuất hiện của từ khóa trong câu hỏi và câu trả lời
  const questionMatches = (question.match(new RegExp(query, 'gi')) || []).length;
  const answerMatches = (answer.match(new RegExp(query, 'gi')) || []).length;
  
  // Câu hỏi chứa từ khóa có trọng số cao hơn
  return questionMatches * 3 + answerMatches;
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