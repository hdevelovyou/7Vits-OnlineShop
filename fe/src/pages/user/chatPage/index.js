import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Chat from '../../../components/Chat'; // Đường dẫn tới component Chat của bạn

export default function ChatPage() {
  
    const { id } = useParams(); // id là seller_id
    const [searchParams] = useSearchParams();

    const receiverId = parseInt(id);
    const receiverName = searchParams.get('receiverName');
    // giả lập tên người nhận (nếu chưa lấy từ server)

    return (
        <div>
            <h2>Trang nhắn tin</h2>
            <Chat receiverId={receiverId} receiverName={receiverName} />
        </div>
    );
}
