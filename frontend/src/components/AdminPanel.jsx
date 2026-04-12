import React, { useState } from 'react'

const AdminPanel = ({ votes, setVotes, showNotification }) => {
  const [newoption, setNewOption] = useState("");
  const handleAddOption = async () => {
    if (!newoption?.trim()) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API}/api/votes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body:JSON.stringify({option:newoption}),
        }
      );
      if(!response.ok) throw new Error("Failed to add option");
      const data =await response.json();
      setVotes([...votes,data]);
      setNewOption("");
      showNotification("Option added successfully","success");

    } catch (error) {
      showNotification(error.message,"error");

    }
  };
  const handleDeleteOption = async (id) => { 
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API}/api/vote/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
         
        })
        if(!response.ok) throw new Error("Failed to DELETE option");
        setVotes(votes?.filter((vote)=>vote._id !==id));
        showNotification("option deleted successfully","success")

    } catch (error) {
      showNotification(error.message,"error");
      
    }
  };
  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="add-option-form">
        <input
          type="text"
          value={newoption}
          onChange={((e) => setNewOption(e.target.value))}
          placeholder="New voting option"
        />
        <button onClick={handleAddOption}>Add option</button>
      </div>
      <div className='current-option'>
        <h3>current Option</h3>
        {votes.map((vote, index) => (
          <div className='option-item' key={index}>
            <span>{vote.option}</span>
            <span>Votes:{vote.votes}</span>
            <button onClick={() => handleDeleteOption(vote._id)} className='delete'>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPanel