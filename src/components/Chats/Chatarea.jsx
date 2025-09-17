import { useContext, useRef, useEffect, useState } from "react"
import { Send } from "lucide-react"
import { SocketContext } from "../../socket";
import { useDispatch, useSelector } from 'react-redux'
import { updateChatMessages } from "../../redux/reducers/Chatsystem";
export default function Chatarea() {
    const messagesEndRef = useRef(null);
    const socket = useContext(SocketContext);
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth);
    const [fileData, setFileData] = useState(null);
    const fileInputRef = useRef(null); // Create a ref for the file input
    const { recipient, chatmessages } = useSelector(state => state.data);
    const baseURL = process.env.REACT_APP_IMG_URL;
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (user.id) {
            socket.emit('register', user.id);  // Register the user on the server
        }
        // Listen for incoming messages
        socket.on('receiveMessage', async(data) => {
            await dispatch(updateChatMessages(data));
        });
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        return () => {
            socket.off('receiveMessage');
        };
    }, [chatmessages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (file) {
            socket.emit('start upload', {
                fileName: file.name,
                sender: user.id, 
                recipient: recipient?._id, 
                message
            });

            const stream = file.stream();
            const reader = stream.getReader();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                socket.emit('file chunk', value);
            }
            socket.emit('file chunk end');
        } else {
            socket.emit('sendMessage', { sender: user.id, sendername: user.name, recipient: recipient?._id, message });
        }
        setMessage('');
        handleRemove()
    }
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFile(file);
        const fileType = file.type;

        if (fileType.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileData({ type: 'image', content: reader.result, name: file.name });
            };
            reader.readAsDataURL(file);
        } else if (fileType.startsWith('video/')) {
            const videoURL = URL.createObjectURL(file);
            setFileData({ type: 'video', content: videoURL, name: file.name });
        } else if (fileType === 'application/pdf') {
            const pdfURL = URL.createObjectURL(file);
            setFileData({ type: 'pdf', content: pdfURL, name: file.name });
        } else {
            // For other types, just display name and size
            setFileData({ type: 'other', name: file.name, size: file.size });
        }
    };

    const renderPreview = () => {
        if (!fileData) return null;

        switch (fileData.type) {
            case 'image':
                return <img src={fileData.content} alt="Preview" style={{ maxWidth: '100px' }} />;
            case 'video':
                return (
                    <video width="320" height="240" controls>
                        <source src={fileData.content} />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'pdf':
                return (
                    <embed
                        src={fileData.content}
                        type="application/pdf"
                        width="100%"
                        height="500px"
                    />
                );
            case 'other':
                return (
                    <div>
                        <p><strong>File Name:</strong> {fileData.name}</p>
                        <p><strong>File Size:</strong> {(fileData.size / 1024).toFixed(2)} KB</p>
                        <button onClick={handleRemove} style={{ marginTop: '10px' }}>
                            Remove File
                        </button>
                    </div>
                    
                );
            default:
                return null;
        }
    };

    const handleRemove = () => {
        setFileData(null);
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                    <img
                        src={recipient?.profileimage ? `${process.env.REACT_APP_IMAGE_URL}${recipient.profileimage}` : '/profile.png'}
                        alt={recipient?.name}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <div className="font-bold">{recipient?.name}</div>
                    </div>
                </div>


                {/* Messages Area */}
                <div className="flex-1 scrollbar-thin overflow-y-auto p-4 bg-gray-50 flex flex-col">
                    <div className="flex flex-col space-y-4 flex-1">
                        {Array.isArray(chatmessages) && chatmessages.map((message, index) => {
                            const isUser = message?.sender === user?.id
                            const showDate =
                                index === 0 ||
                                new Date(message?.createdAt).toDateString() !==
                                new Date(message[index - 1]?.createdAt).toDateString()

                            return (
                                (message.sender === recipient._id || message.recipient === recipient._id) ? (
                                <div key={message?._id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                {new Date(message.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg shadow-sm ${isUser ? "bg-teal-500 text-white" : "bg-white text-black"
                                                }`}
                                        >
                                            {message.file && (
                                                <a
                                                    href={`${baseURL}tmp/${message.file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    📎 {message.fileName}
                                                </a>
                                            )}
                                            <div> {message.message}</div>
                                            <div className={`text-xs ${isUser ? "text-teal-100" : "text-gray-500"} text-right mt-1`}>
                                                {formatTime(message?.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ): null
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200 items-center">
                    <div style={{ marginTop: '20px' }}>{renderPreview()}</div>

                    <form onSubmit={sendMessage} className="w-full flex items-center">
                        <label htmlFor="file-upload" className="cursor-pointer text-teal-500">
                            <img src="/file.png" alt="File Icon" className="h-10 w-10" />
                        </label>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{ width: '80%', padding: '8px' }}
                            className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileChange}
                            ref={fileInputRef} // Create a ref to the file input
                        />
                        
                        <button
                            className="ml-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 focus:outline-none"
                            type="submit"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </>
        
    )
}
