import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Chat from '../../../components/Chat'; 

export default function ChatPage() {
  
    const { id } = useParams(); // id là seller_id
    const [searchParams] = useSearchParams();

    const receiverId = parseInt(id);
    const receiverName = searchParams.get('receiverName');

    return (
        <div>
            <Chat receiverId={receiverId} receiverName={receiverName} />
        </div>
    );
}
