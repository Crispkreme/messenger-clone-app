import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';

const ChatLayout = ({ children }) => {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations;
    
    console.log('conversations: ', conversations);
    console.log('selected conversations: ', selectedConversations);

    return (
        <AuthenticatedLayout>
            ChatLayout
            <div>{ children }</div>
        </AuthenticatedLayout>
    )
}

export default ChatLayout