import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import './style/Account.css';  // Import the new CSS file for Account styling


function Account() {
    const items = ['Username: ', 'Name: ', 'Password: ', 'Email Address: '];
    return(
       <div className="Account-wrapper">
        <div className="Account-hot-bar">
                <div className = "dashboard-row">
                <div className="Account-logo-img">
                    <img src="/images/Sb-logo.png" alt="Logo"/>
                </div>
                    {/* Tabs as Buttons */}
                    <div className="Account-nav-col">
                        <Link to="/Dashboard" className="home-tab-link" >DASHBOARD</Link>
                    </div>
                    <div className="Account-nav-col">
                        <Link to="/About" className="home-tab-link" >ABOUT</Link>
                    </div>
                    <div className="Account-nav-col">
                        <Link to="/Help" className="home-tab-link" >HELP</Link>
                    </div>

                </div>

            </div>
            
            <ul className="Account-info-items">
                {items.map((item, index) => {  // Changed () to {}
                let inputType = "text"; 
                let placeholder = `Enter ${item.replace(": ", "")}`;

                switch(item) {  // Fixed typo in 'switch'
                    case "Password: ":
                        inputType = "XXXXXXXXXX";
                        break;
                    case "Username: ":
                        inputType = "Non Editable";
                        break;
                    case "Name: ":  // Fixed duplicate "Password: " case
                        inputType = "Firstname Lastname";
                        break;
                    case "Email Address: ":  // Fixed duplicate "Password: " case
                        inputType = "xxxxxxxx@xxxxx.com";
                        break;
                    default: 
                        inputType = "text";
                }

                return (
                    <li key={index}>
                        {item}
                        <input className="Account-Input-Items"
                            type="text" 
                            value={inputType} 
                            readOnly  // Fixed 'readonly' to 'readOnly'
                        />
                        <br />
                        <br />
                    </li>
                );
            })}
            </ul>
        </div>
        
    );

};

// return 
export default Account;
