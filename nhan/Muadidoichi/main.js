const textContainer = document.querySelector(".text-introduce");
const text = textContainer.innerHTML;

function showText() {
    let index = 0;
    textContainer.innerHTML = text[0];
    index = 1;

    function type() {
        if (index < text.length) {
            textContainer.innerHTML += text[index];
            index++;
            
            // Kiểm tra nếu đây là ký tự cuối, gọi showText() ngay lập tức
            if (index < text.length-1) {
                setTimeout(type, 50);
            } else {
                showText();
            }
        }
    }

    type();
}

showText();