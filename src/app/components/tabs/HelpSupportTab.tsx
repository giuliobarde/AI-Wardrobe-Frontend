import React, { useState } from "react";
import ErrorModal from "../ErrorModal";

type FAQItem = {
  question: string;
  answer: string;
};

const HelpSupportTab: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("Error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs: FAQItem[] = [
    {
      question: "How do I add items to my wardrobe?",
      answer: "You can add items to your wardrobe by clicking the \"Add Item\" button on your profile or wardrobe page. Upload a photo, fill in the details, and your item will be added to your collection."
    },
    {
      question: "How do I create outfits?",
      answer: "To create an outfit, go to the \"Outfits\" tab and click \"Create New Outfit.\" Then select items from your wardrobe to combine them into an outfit."
    },
    {
      question: "Can I share my wardrobe with others?",
      answer: "Yes, you can share your wardrobe or specific outfits by enabling sharing in your privacy settings and using the share button on individual items or outfits."
    }
  ];

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsErrorModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // For demo purposes, randomly succeed or fail
          if (Math.random() > 0.3) {
            resolve();
          } else {
            reject(new Error("Network error. Please try again later."));
          }
        }, 1000);
      });
      
      console.log("Support request submitted:", { subject, message });
      
      // Reset form on success
      setSubject("");
      setMessage("");
      
      // Show success message
      showModal("Success", "Your support request has been submitted successfully. We'll get back to you soon!");
      
    } catch (err) {
      // Show error message
      const errorMessage = err instanceof Error ? err.message : "Failed to submit support request. Please try again.";
      showModal("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Help & Support</h2>
      
      <div className="space-y-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span>{faq.question}</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-3 group-open:animate-fadeIn">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Support</h3>
          <p className="text-gray-600 mb-4">
            Need help with something else? Our support team is ready to assist you.
          </p>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="What can we help you with?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transition hover:opacity-90 disabled:opacity-70 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Error/Success Modal */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </>
  );
};

export default HelpSupportTab;