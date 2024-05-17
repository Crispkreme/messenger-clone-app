import React from 'react';
import { usePage } from '@inertiajs/react';

const ChatLayout = ({ children }) => {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations;
    
    console.log('conversations: ', conversations);
    console.log('selected conversations: ', selectedConversations);

    return (
        <>
            ChatLayout
            <div>{ children }</div>
        </>
    )
}

export default ChatLayout