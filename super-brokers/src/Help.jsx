import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Help() {
    const [openItems, setOpenItems] = useState({});

    const helpItems = [
        {
            title: "Getting Started Guide",
            content: "Welcome to our platform! This guide will walk you through the basic features and functionalities. Learn how to navigate the dashboard, access key features, and make the most of your experience."
        },
        {
            title: "Frequently Asked Questions",
            content: "Find answers to common questions about account management, system features, and general usage. If you can't find what you're looking for, feel free to contact our support team."
        },
        {
            title: "Technical Support",
            content: "Having technical issues? Learn how to troubleshoot common problems, reset your password, or get in touch with our technical support team for assistance."
        },
        {
            title: "Account Management",
            content: "Learn how to manage your account settings, update your profile information, and customize your preferences for a better experience."
        }
    ];

    const toggleItem = (index) => {
        setOpenItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-secondary position-relative">
            {/* Hot Bar at the top with red background */}
            <div className="hot-bar w-100" style={{ backgroundColor: '#FF0000' }}>
                <div className="row align-items-center no-gutters">
                    {/* Logo on the left */}
                    <div className="col-auto d-flex align-items-center">
                        <img 
                            src="/images/Sb-logo.png"
                            alt="Logo" 
                            style={{ width: '100px', height: '100px', border: '0px' }}
                        />
                    </div>

                    {/* Tabs as Buttons */}
                    <div className="col-auto d-flex justify-content-center align-items-center">
                        <Link to="/Dashboard"
                            className="folder-tab text-center" 
                            style={{
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderBottom: 'none',
                                padding: '7px 20px',
                                fontSize: '16px',
                                height: '40px',
                                marginTop: '60px',
                                zIndex: 1,
                                cursor: 'pointer', 
                                outline: 'none',
                                textDecoration: 'none', 
                                color: 'inherit' 
                            }}
                        >
                            Dashboard
                        </Link>
                    </div>
                    <div className="col-auto d-flex justify-content-center align-items-center">
                        <Link to="/About"
                            className="folder-tab text-center" 
                            style={{
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderBottom: 'none',
                                padding: '7px 20px',
                                fontSize: '16px',
                                height: '40px',
                                marginTop: '60px',
                                zIndex: 1,
                                cursor: 'pointer', 
                                outline: 'none',
                                textDecoration: 'none', 
                                color: 'inherit' 
                            }}
                        >
                            About
                        </Link>
                    </div>
                    <div className="col-auto d-flex justify-content-center align-items-center">
                        <Link to="/Help"
                            className="folder-tab text-center" 
                            style={{
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderBottom: 'none',
                                padding: '7px 20px',
                                fontSize: '16px',
                                height: '40px',
                                marginTop: '60px',
                                zIndex: 1,
                                cursor: 'pointer', 
                                outline: 'none',
                                textDecoration: 'none', 
                                color: 'inherit' 
                            }}
                        >
                            Help
                        </Link>
                    </div>
                </div>
            </div>

            {/* Help Content */}
            <div className="container mt-4 pb-4">
                <h2 className="mb-4">Help Center</h2>
                <div className="help-items">
                    {helpItems.map((item, index) => (
                        <div 
                            key={index}
                            className="mb-3"
                            style={{
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <button
                                onClick={() => toggleItem(index)}
                                className="w-100 text-start border-0 p-3"
                                style={{
                                    backgroundColor: '#f0f0f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ fontWeight: '500' }}>{item.title}</span>
                                <span>{openItems[index] ? '−' : '+'}</span>
                            </button>
                            
                            {openItems[index] && (
                                <div 
                                    className="p-3"
                                    style={{
                                        backgroundColor: 'white',
                                        borderTop: '1px solid #dee2e6'
                                    }}
                                >
                                    {item.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Help;