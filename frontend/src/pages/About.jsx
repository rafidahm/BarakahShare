import Card from '../components/Card';
import { HeartIcon, BookOpenIcon, UsersIcon } from '@heroicons/react/24/outline';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8">About IIUCShare</h1>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          IIUCShare is a charity-driven platform designed exclusively for IIUC (International Islamic University Chittagong) 
          undergraduate students. Our mission is to foster a culture of sharing and mutual support within our academic community.
        </p>
        <p className="text-gray-700">
          We believe that knowledge and resources should be accessible to all students, regardless of their financial situation. 
          By sharing academic items—whether books, notes, calculators, or laptops—we not only help each other succeed but also 
          embody the Islamic principles of charity (Sadaqah) and community support.
        </p>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <HeartIcon className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Charity-Driven</h3>
          <p className="text-gray-600">
            Built on the principle of giving and helping others without expecting anything in return.
          </p>
        </Card>

        <Card className="text-center">
          <BookOpenIcon className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Academic Focus</h3>
          <p className="text-gray-600">
            Specifically designed for sharing academic resources that help students excel in their studies.
          </p>
        </Card>

        <Card className="text-center">
          <UsersIcon className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Community Building</h3>
          <p className="text-gray-600">
            Strengthening bonds between IIUC students through acts of kindness and support.
          </p>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Islamic Motivation</h2>
        <p className="text-gray-700 mb-4">
          The concept of IIUCShare is deeply rooted in Islamic teachings about charity, knowledge sharing, and community support:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Sadaqah (Charity):</strong> The Prophet Muhammad (PBUH) said, "The best charity is that given when one is in need." 
            By sharing our resources, we practice this noble virtue.
          </li>
          <li>
            <strong>Knowledge Sharing:</strong> "The ink of the scholar is more sacred than the blood of the martyr." 
            Sharing knowledge and resources is highly encouraged in Islam.
          </li>
          <li>
            <strong>Community Support:</strong> "The best of people are those who are most beneficial to others." 
            IIUCShare helps us support our fellow students in their academic journey.
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">How to Use</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">For Donors:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Login with your IIUC email (@ugrad.iiuc.ac.bd)</li>
              <li>Click "Donate Item" and fill in the details</li>
              <li>Choose whether to donate permanently or lend temporarily</li>
              <li>Wait for requests and approve those you can fulfill</li>
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">For Requesters:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Browse available items using filters</li>
              <li>Click on an item to see details</li>
              <li>Send a request with an optional message</li>
              <li>Wait for approval and coordinate with the owner</li>
            </ol>
          </div>
        </div>
      </Card>

      <Card className="mt-8 bg-primary/10 border-2 border-primary/20">
        <p className="text-center text-gray-700">
          <strong>Remember:</strong> This platform is built on trust and goodwill. Please be respectful, 
          communicate clearly, and honor your commitments. Together, we can build a stronger, more supportive IIUC community.
        </p>
      </Card>
    </div>
  );
};

export default About;
