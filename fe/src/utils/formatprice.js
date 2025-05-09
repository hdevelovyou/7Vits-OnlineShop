export const formatVND = (amount) => {
  // Xử lý giá trị không hợp lệ
  if (isNaN(amount)) return "0đ";
  
  // Định dạng tiền tệ
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(Number(amount))
    .replace(/\s₫/, "đ");
};

// Có thể thêm các hàm format khác ở đây
// export const formatDate = ...