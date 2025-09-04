import React from 'react';
import Button from './common/Button';
import { APP_NAME } from '../constants';
import { ChatBubbleLeftRightIcon, ClipboardDocumentCheckIcon, ChartPieIcon } from './common/Icons';

interface HomeProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-text-primary">{title}</h3>
        <p className="text-text-secondary">{children}</p>
    </div>
);

const Home: React.FC<HomeProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-background text-text-primary animate-fade-in">
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
            <Button onClick={onGetStarted} variant="primary" size="md">
                Get Started
            </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full filter blur-3xl opacity-50"></div>

            <div className="container mx-auto px-4 relative z-1">
                <h2 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-4 animate-slide-in-up">
                    Unlock Your Learning Potential
                </h2>
                <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                    {APP_NAME} is your personal AI-powered study partner. Get instant explanations, take practice exams, and receive smart feedback to master any subject.
                </p>
                <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                    <Button onClick={onGetStarted} size="lg" className="shadow-2xl shadow-primary/40">
                        Get Started for Free
                    </Button>
                </div>
            </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">The Smarter Way to Study</h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12">
                    Everything you need to succeed, all in one intelligent platform.
                </p>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />} title="Personalized AI Tutor">
                        Stuck on a concept? Ask any question and get clear, simple explanations from your personal AI tutor, tailored to your grade level.
                    </FeatureCard>
                    <FeatureCard icon={<ClipboardDocumentCheckIcon className="w-8 h-8" />} title="On-Demand Practice Exams">
                        Test your knowledge by generating practice exams on any subject. It's the perfect way to prepare and build confidence.
                    </FeatureCard>
                    <FeatureCard icon={<ChartPieIcon className="w-8 h-8" />} title="Actionable Feedback">
                        After each exam, receive a detailed report with constructive AI feedback to understand your mistakes and learn faster.
                    </FeatureCard>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold mb-12">Get Started in 3 Easy Steps</h2>
                 <div className="relative grid md:grid-cols-3 gap-8">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 hidden md:block"></div>
                    <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-primary rounded-full text-primary font-bold text-2xl mb-4 z-10">1</div>
                        <h3 className="font-bold text-xl mb-2">Create Your Profile</h3>
                        <p className="text-text-secondary">Tell us your name and grade so we can personalize your learning experience.</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-primary rounded-full text-primary font-bold text-2xl mb-4 z-10">2</div>
                        <h3 className="font-bold text-xl mb-2">Choose a Subject</h3>
                        <p className="text-text-secondary">Pick from a wide range of subjects you want to learn about or take an exam in.</p>
                    </div>
                     <div className="relative flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-primary rounded-full text-primary font-bold text-2xl mb-4 z-10">3</div>
                        <h3 className="font-bold text-xl mb-2">Start Learning</h3>
                        <p className="text-text-secondary">Chat with your AI tutor, ace your exams, and watch your grades improve!</p>
                    </div>
                 </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-white py-20">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold text-text-primary max-w-2xl mx-auto">
                    Ready to Transform Your Study Habits?
                </h2>
                <p className="text-lg text-text-secondary mt-4 mb-8">Join thousands of students learning smarter with {APP_NAME}.</p>
                <Button onClick={onGetStarted} size="lg" className="shadow-2xl shadow-primary/40">
                    Sign Up Now
                </Button>
            </div>
        </section>
      </main>

      <footer className="bg-text-primary text-white py-8">
        <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
