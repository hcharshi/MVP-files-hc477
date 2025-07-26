import React, { useState } from "react";
import "../CSS/CreateQuestionManual.css";

export default function CreateQuestionManualForm() {
  const [formData, setFormData] = useState({
    category: "",
    text: "",
    answerOptions: ["", "", "", ""],
    correctAnswer: "",
    questionType: "multiple",
    difficulty: "easy",
    author: "Admin", // This should come from logged-in user
    status: "approved" // Admin-created questions are auto-approved
  });

  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState("");

  const categories = [
    "General Knowledge",
    "Entertainment",
    "Science",
    "Sports",
    "Geography",
    "History",
    "Art",
    "Animals",
    "Politics",
    "Vehicles"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnswerOptionChange = (index, value) => {
    const newOptions = [...formData.answerOptions];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      answerOptions: newOptions
    }));
  };

  const handleQuestionTypeChange = (e) => {
    const type = e.target.value;
    setFormData(prev => ({
      ...prev,
      questionType: type,
      answerOptions: type === "boolean" ? ["True", "False"] : ["", "", "", ""],
      correctAnswer: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.text || !formData.correctAnswer) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/questions/create-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          answerOptions: formData.questionType === "multiple" 
            ? formData.answerOptions.filter(opt => opt.trim() !== "")
            : formData.answerOptions,
          createdBy: "Admin",
          createdAt: new Date().toISOString()
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Question created successfully (Auto-approved)!");
        // Reset form
        setFormData({
          category: "",
          text: "",
          answerOptions: ["", "", "", ""],
          correctAnswer: "",
          questionType: "multiple",
          difficulty: "easy",
          author: "Admin",
          status: "approved"
        });
      } else {
        alert(`Error: ${data.error || "Failed to create question"}`);
      }
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error creating question. Please try again.");
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Parse bulk questions (expecting JSON format)
      const questions = JSON.parse(bulkQuestions);
      
      if (!Array.isArray(questions)) {
        alert("Please provide an array of questions in JSON format");
        return;
      }

      const response = await fetch("http://localhost:5001/api/questions/create-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: questions.map(q => ({
            ...q,
            status: "approved",
            createdBy: "Admin",
            createdAt: new Date().toISOString()
          }))
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully created ${data.created} questions!`);
        setBulkQuestions("");
      } else {
        alert(`Error: ${data.error || "Failed to create questions"}`);
      }
    } catch (error) {
      console.error("Error creating bulk questions:", error);
      alert("Error parsing JSON or creating questions. Please check your format.");
    }
  };

  return (
    <div className="create-manual-container">
      <div className="form-container">
        <h2>Create Question (Admin)</h2>
        <p className="admin-note">
          Admin-created questions are automatically approved and added to the active pool.
        </p>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${!bulkMode ? 'active' : ''}`}
            onClick={() => setBulkMode(false)}
          >
            Single Question
          </button>
          <button
            className={`mode-btn ${bulkMode ? 'active' : ''}`}
            onClick={() => setBulkMode(true)}
          >
            Bulk Import
          </button>
        </div>

        {!bulkMode ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="questionType">Question Type *</label>
              <select
                id="questionType"
                name="questionType"
                value={formData.questionType}
                onChange={handleQuestionTypeChange}
              >
                <option value="multiple">Multiple Choice</option>
                <option value="boolean">True/False</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty *</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="text">Question *</label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter your trivia question here..."
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Answer Options *</label>
              {formData.questionType === "multiple" ? (
                <>
                  {formData.answerOptions.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleAnswerOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="answer-option"
                    />
                  ))}
                </>
              ) : (
                <div className="true-false-options">
                  <div>1. True</div>
                  <div>2. False</div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="correctAnswer">Correct Answer *</label>
              {formData.questionType === "multiple" ? (
                <select
                  id="correctAnswer"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select correct answer</option>
                  {formData.answerOptions.map((option, index) => (
                    option.trim() && (
                      <option key={index} value={option}>
                        Option {index + 1}: {option}
                      </option>
                    )
                  ))}
                </select>
              ) : (
                <select
                  id="correctAnswer"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select correct answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              )}
            </div>

            <button type="submit" className="submit-btn">
              Create Question (Auto-Approved)
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit}>
            <div className="form-group">
              <label htmlFor="bulkQuestions">Bulk Questions (JSON Format) *</label>
              <textarea
                id="bulkQuestions"
                value={bulkQuestions}
                onChange={(e) => setBulkQuestions(e.target.value)}
                placeholder={`Example format:
[
  {
    "category": "Science",
    "text": "What is the chemical symbol for gold?",
    "answerOptions": ["Au", "Ag", "Go", "Gd"],
    "correctAnswer": "Au",
    "questionType": "multiple",
    "difficulty": "easy"
  },
  {
    "category": "History",
    "text": "The Great Wall of China was built to keep out invaders.",
    "answerOptions": ["True", "False"],
    "correctAnswer": "True",
    "questionType": "boolean",
    "difficulty": "medium"
  }
]`}
                rows="15"
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Import All Questions (Auto-Approved)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}