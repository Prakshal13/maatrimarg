import re

with open('src/pages/LandingPage.jsx', 'r') as f:
    content = f.read()

# Add FAQAccordion component outside LandingPage
faq_component = """
const FAQAccordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
          {answer}
        </div>
      </div>
    </div>
  );
};
"""

# Insert FAQAccordion before LandingPage component
content = content.replace("const LandingPage = () => {", faq_component + "\nconst LandingPage = () => {")

faq_section_ui = """
      {/* FAQ Section */}
      <section className="w-full bg-[#f0f4f8] dark:bg-slate-900/50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 text-[#006b5f] dark:text-teal-400 mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">help</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              {t('faq_title') || 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <FAQAccordion question={t('faq_q1')} answer={t('faq_a1')} />
            <FAQAccordion question={t('faq_q2')} answer={t('faq_a2')} />
            <FAQAccordion question={t('faq_q3')} answer={t('faq_a3')} />
            <FAQAccordion question={t('faq_q4')} answer={t('faq_a4')} />
            <FAQAccordion question={t('faq_q5')} answer={t('faq_a5')} />
          </div>

        </div>
      </section>

      {/* Footer */}
"""

content = content.replace("      {/* Footer */}", faq_section_ui)

with open('src/pages/LandingPage.jsx', 'w') as f:
    f.write(content)
