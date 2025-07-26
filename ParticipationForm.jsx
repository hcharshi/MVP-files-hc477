import React, { useState } from "react";

export default function ParticipationForm() {
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/participate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          score: parseInt(score), 
          category,
          quizId: `quiz-${Date.now()}` 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      alert(data.message || "Participation submitted!");
      
      // Reset form
      setName("");
      setScore("");
      setCategory("");
    } catch (error) {
      console.error("Error submitting participation:", error);
      alert("Error submitting participation. Please try again.");
    }
  };

  return (
    <div className="participation-container">
      <div className="form-container">
        <h2>Submit Quiz Score</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            min="0"
            required
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="General Knowledge">General Knowledge</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Science">Science</option>
            <option value="Sports">Sports</option>
            <option value="Geography">Geography</option>
            <option value="History">History</option>
          </select>
          <button type="submit">Submit Score</button>
        </form>
      </div>
    </div>
  );
}