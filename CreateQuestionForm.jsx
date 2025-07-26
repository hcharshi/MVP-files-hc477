import React, { useState } from "react";
import "../CSS/CreateQuestion.css"; // You'll need to create this CSS file

export default function CreateQuestionForm() {
  const [formData, setFormData] = useState({
    category: "",
    text: "",
    answerOptions: ["", "", "", ""], // For multiple choice
    correctAnswer: "",
    questionType: "multiple", // 'multiple' or 'boolean'
    difficulty: "easy", // 'easy', 'medium', 'hard'
    author: "" // This should come from logged-in user eventually
  });

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
    
    // Validation
    if (!formData.category || !formData.text || !formData.correctAnswer) {
      alert("Please fill in all required fields!");
      return;
    }

    // For multiple choice, check if all answer options are filled
    if (formData.questionType === "multiple") {
      const filledOptions = formData.answerOptions.filter(opt => opt.trim() !== "");
      if (filledOptions.length < 2) {
        alert("Please provide at least 2 answer options!");
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:5001/api/questions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          answerOptions: formData.questionType === "multiple" 
            ? formData.answerOptions.filter(opt => opt.trim() !== "")
            : formData.answerOptions
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Question created successfully!");
        // Reset form
        setFormData({
          category: "",
          text: "",
          answerOptions: ["", "", "", ""],
          correctAnswer: "",
          questionType: "multiple",
          difficulty: "easy",
          author: ""
        });
      } else {
        alert(`Error: ${data.error || "Failed to create question"}`);
      }
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error creating question. Please try again.");
    }
  };

  return (
    <div className="create-question-container">
      <div className="form-container">
        <h2>Create New Trivia Question</h2>
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
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

          {/* Question Type */}
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

          {/* Difficulty */}
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

          {/* Question Text */}
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

          {/* Answer Options */}
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

          {/* Correct Answer */}
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

          {/* Author (temporary - should come from logged-in user) */}
          <div className="form-group">
            <label htmlFor="author">Author Name *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Your name"
              required
            />
          </div>

          <button type="submit" className="submit-btn">Create Question</button>
        </form>
      </div>
    </div>
  );
}