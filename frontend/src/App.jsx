import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DonateItem from './pages/DonateItem';
import LendItem from './pages/LendItem';
import BrowseItems from './pages/BrowseItems';
import RecentItems from './pages/RecentItems';
import RequestItem from './pages/RequestItem';
import MyRequests from './pages/MyRequests';
import MyContributions from './pages/MyContributions';
import UserRequest from './pages/UserRequest';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import About from './pages/About';
import EditItem from './pages/EditItem';
import WishList from './pages/WishList';
import MyWishlist from './pages/MyWishlist';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donate" element={<DonateItem />} />
            <Route path="/lend" element={<LendItem />} />
            <Route path="/browse" element={<BrowseItems />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/my-wishlist" element={<MyWishlist />} />
            <Route path="/recent-items" element={<RecentItems />} />
            <Route path="/request/:id" element={<RequestItem />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/my-contributions" element={<MyContributions />} />
            <Route path="/user-request" element={<UserRequest />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
