import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';

const ChatLayout = ({ children }) => {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations;
    
    console.log('conversations: ', conversations);
    console.log('selected conversations: ', selectedConversations);

    useEffect(() => {
        window.Echo.join('chat-room')
            .here((users) => {
                console.log('here', users);
            })
            .joining((user) => {
                console.log('joining', user);
            })
            .leaving((user) => {
                console.log('leaving', user);
            })
            .error((error) => {
                console.log('error', error);
            });
    }, []);

    return (
        <>
            ChatLayout
            <div>{ children }</div>
        </>
    )
}

export default ChatLayout