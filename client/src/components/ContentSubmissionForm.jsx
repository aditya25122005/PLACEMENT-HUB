import React, { useState } from "react";
import axios from "axios";

const ContentSubmissionForm = ({ onSubmissionSuccess, subjectList }) => {
  const [formData, setFormData] = useState({
    topic:
      subjectList && subjectList.length > 0
        ? subjectList[0]
        : "Aptitude",
    question_text: "",
    explanation: "",
    source_url: "",
    dsaProblemLink: "",
    youtubeSolutionLink: "",
  });

  const [contentType, setContentType] = useState("text");
  const [pdfFile, setPdfFile] = useState(null);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic) {
      setMessage("❌ Please select a topic.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      submitData.append("contentType", contentType);

      if (contentType === "pdf" && pdfFile) {
        submitData.append("pdf", pdfFile);
      }

      await axios.post("/api/content/submit", submitData);

      setMessage("✅ Success! Your content is submitted for moderator review.");

      setFormData({
        topic:
          subjectList && subjectList.length > 0
            ? subjectList[0]
            : "Aptitude",
        question_text: "",
        explanation: "",
        source_url: "",
        dsaProblemLink: "",
        youtubeSolutionLink: "",
      });

      setContentType("text");
      setPdfFile(null);

      if (onSubmissionSuccess) onSubmissionSuccess();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "❌ Submission failed. Server error.";
      setMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Submit a Resource
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Contribute useful content for placement prep. Moderator approval
          required before publishing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CONTENT TYPE + TOPIC */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="text">Text Theory</option>
              <option value="video">Video Resource</option>
              <option value="pdf">PDF Notes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Topic Category
            </label>
            <select
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjectList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QUESTION TEXT */}
        {contentType !== "pdf" && (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Question / Content Text
            </label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              placeholder="Type the question or main concept..."
              rows="3"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* PDF UPLOAD */}
        {contentType === "pdf" && (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Upload PDF Notes
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="block w-full text-sm text-slate-600"
            />
          </div>
        )}

        {/* EXPLANATION + LINKS */}
        {contentType !== "pdf" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Explanation (Optional)
              </label>
              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                rows="2"
                placeholder="Add explanation if available..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                External Links (Optional)
              </h4>

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="url"
                  name="source_url"
                  placeholder="Original Source URL"
                  value={formData.source_url}
                  onChange={handleChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="url"
                  name="dsaProblemLink"
                  placeholder="DSA Problem Link"
                  value={formData.dsaProblemLink}
                  onChange={handleChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="url"
                  name="youtubeSolutionLink"
                  placeholder="YouTube Solution Link"
                  value={formData.youtubeSolutionLink}
                  onChange={handleChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit for Verification"}
        </button>
      </form>

      {/* MESSAGE */}
      {message && (
        <div
          className={`mt-5 text-sm font-medium ${
            message.startsWith("✅")
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default ContentSubmissionForm;