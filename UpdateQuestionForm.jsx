import React, { useState, useEffect } from "react";
import "../CSS/UpdateQuestion.css";

export default function UpdateQuestionForm() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    text: "",
    answerOptions: [],
    correctAnswer: "",
    questionType: "",
    difficulty: "",
    status: "",
    notes: ""
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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/questions");
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setFormData({
      category: question.category,
      text: question.question || question.text,
      answerOptions: question.options || question.answerOptions || [],
      correctAnswer: question.answer || question.correctAnswer,
      questionType: question.questionType || (question.options?.length === 2 ? "boolean" : "multiple"),
      difficulty: question.difficulty,
      status: question.status || "approved",
      notes: ""
    });
  };

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

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      answerOptions: [...prev.answerOptions, ""]
    }));
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.answerOptions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      answerOptions: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedQuestion) {
      alert("Please select a question to update");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/questions/update/${selectedQuestion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          updatedBy: "Manager", 
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert("Question updated successfully!");
        fetchQuestions(); 
        setSelectedQuestion(null);
        setFormData({
          category: "",
          text: "",
          answerOptions: [],
          correctAnswer: "",
          questionType: "",
          difficulty: "",
          status: "",
          notes: ""
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to update question"}`);
      }
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Error updating question. Please try again.");
    }
  };

  // Filter questions based on search and category
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = searchTerm === "" || 
      q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "" || q.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="update-question-container">
      <div className="update-question-content">
        <h2>Update Trivia Question</h2>
        
        <div className="question-selector">
          <h3>Select a Question to Update</h3>
          
          <div className="filters">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="questions-list">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                className={`question-item ${selectedQuestion?.id === question.id ? 'selected' : ''}`}
                onClick={() => handleQuestionSelect(question)}
              >
                <div className="question-preview">
                  <strong>{question.category}</strong> - {question.question || question.text}
                </div>
                <div className="question-meta">
                  Difficulty: {question.difficulty} | 
                  Status: {question.status || 'approved'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedQuestion && (
          <form onSubmit={handleSubmit} className="update-form">
            <h3>Edit Question Details</h3>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="text">Question Text</label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Answer Options</label>
              {formData.answerOptions.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleAnswerOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.answerOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="remove-option"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {formData.questionType === "multiple" && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="add-option"
                >
                  Add Option
                </button>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="correctAnswer">Correct Answer</label>
              <select
                id="correctAnswer"
                name="correctAnswer"
                value={formData.correctAnswer}
                onChange={handleInputChange}
                required
              >
                <option value="">Select correct answer</option>
                {formData.answerOptions.map((option, index) => (
                  option && (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  )
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Update Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add notes about this update..."
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="update-btn">Update Question</button>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuestion(null);
                  setFormData({
                    category: "",
                    text: "",
                    answerOptions: [],
                    correctAnswer: "",
                    questionType: "",
                    difficulty: "",
                    status: "",
                    notes: ""
                  });
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}