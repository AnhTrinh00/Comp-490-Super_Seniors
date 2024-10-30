import React from 'react';

function Home() {
    return (
        <div className="main-wrapper">
            {/* Hot Bar at the top */}
            <div className="hot-bar">
                <div className="row align-items-center no-gutters">
                    {/* Logo on the left */}
                    <div className="col-auto d-flex align-items-center">
                        <img 
                            src="/images/Sb-logo.png" 
                            alt="Logo"
                        />
                    </div>

                    {/* Tabs as Buttons */}
                    <div className="col-auto d-flex justify-content-center align-items-center">
                        <button 
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
                                cursor: 'pointer', // Make it clear it's clickable
                                outline: 'none', // Remove outline on focus
                            }}
                        >
                            Dashboard
                        </Link>
                    </div>
                    <div className="col-auto d-flex justify-content-center align-items-center">
                        <button 
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
                                cursor: 'pointer', // Make it clear it's clickable
                                outline: 'none', // Remove outline on focus
                            }}
                        >
                            About
                        </button>
                    </div>
                    <div className="col-auto d-flex justify-content-center align-items-center">
                        <button 
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
                                cursor: 'pointer', // Make it clear it's clickable
                                outline: 'none', // Remove outline on focus
                            }}
                        >
                            Help
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content area */}
            <div className="main-content d-flex mt-3">
                {/* Left side: Search bar and rows */}
                <div className="d-flex flex-fill flex-column" style={{ marginRight: '150px', marginLeft: '100px' }}>
                    {/* Search Bar */}
                    <div className="d-flex mb-4">
                        <input 
                            type="text" 
                            className="form-control search-bar" 
                            placeholder="Search..."
                        />
                        <button className="btn btn-primary">Search</button>
                    </div>
                    <div style={{ marginBottom: '20px', fontSize: '20px' }}>STOCK</div>
                    
                    {/* Rows */}
                    <div className="bg-light p-4 mb-4 text-center">Row 1</div>
                    <div className="bg-light p-4 mb-4 text-center">Row 2</div>
                    <div className="bg-light p-4 text-center">Row 3</div>
                </div>

                {/* Right side: Bubble rows */}
                <div className="d-flex flex-column">
                    <div className="bubble mb-4 text-center">Bubble 1</div>
                    <div className="bubble mb-4 text-center">Bubble 2</div>
                    <div className="bubble text-center">Bubble 3</div>
                </div>
            </div>
        </div>
    );
}

export default Home;
