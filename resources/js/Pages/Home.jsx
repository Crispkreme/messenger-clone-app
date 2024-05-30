import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';

function Home({ selectedConversation = null, messages = null }) {
    
    const [setLocalMessages, isSetLocalMessages] = useState([]);
    const messagesCtrRef = useRef(null);

    useEffect(() => {
        isSetLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    useEffect(() => {
        setTimeout(() => {
            messagesCtrRef.current.scrollTop = messagesCtrRef.current.scrollHeight;
        }, 10)
    }, [selectedConversation])

    return (
        <>
            { !messages && (
                <div className='flex flex-col gap-8 justify-center items-center text-center h-full opacity-35'>
                    <div className='text-2xl md:text-4xl p-16 text-slate-200'>
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className='w-32 h-32 inline-block' />
                </div>
            )}

            { messages && (
                <>
                    <ConversationHeader selectedConversation={selectedConversation} />
                    <div 
                        className='flex-1 overflow-y-auto p-5'
                        ref={messagesCtrRef}
                    >
                        { setLocalMessages.length === 0 && (
                            <div className='flex justify-center items-center h-full'>
                                <div className='text-lg text-slate-200'>
                                    No messages found
                                </div>
                            </div>
                        )}

                        { setLocalMessages.length > 0 && (
                            <div className='flex-1 flex flex-col'>
                                {setLocalMessages.map((messages) => (
                                    <MessageItem 
                                        key={messages.id}
                                        message={messages}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* <MessageInput conversation={selectedConversation} /> */}
                </>
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
}

export default Home