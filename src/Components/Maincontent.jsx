import React, { useState, useRef } from "react";
import Profilecard from "./Profilecard";
import "../App.css";

function Maincontent() {
  const [profiles, setProfiles] = useState([]); // State to store profiles
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const username = formData.get("addprofile");
    const password = formData.get("addpass");
    const list = formData.get("addlist");
    const listdesc = formData.get("listdesc");

    const newProfile = {
      username: username,
      password: password,
      list: list,
      listdesc: listdesc,
    };

    setProfiles([...profiles, newProfile]);

    e.target.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <p>
            Full Name: <input type="text" name="addprofile" required />
          </p>
          <p>
            Email: <input type="email" name="addemail" required />
          </p>
          <p>
            Contact Number: <input type="number" name="addcontnum" required />
          </p>
          <p>
            Address: <input type="text" name="newaddress" required />
          </p>
          <p>
            Facebook Link: <input type="text" name="newlink" required />
          </p>
          <p>
            Attach Profile Picture:{" "}
            <input 
              type="file"
              accept="image/png, image/jpeg"
              name="addimage"
              ref={fileInputRef}
            />
          </p>
          <p>
            <input type="submit" name="submit" value="Add User" />
          </p>
        </form>
        <ul>
          <h2>Profiles</h2>
        </ul>
      </div>
      <div className="Profile-wrapper">
        {profiles.map((profile, index) => (
          <Profilecard
            key={index}
            photo={profile.photo}
            fullname={profile.fullname}
            email={profile.email}
            contnum={profile.contnum}
            address={profile.address}
            link={profile.link}
          />
        ))}
      </div>
    </>
  );
}

export default Maincontent; 