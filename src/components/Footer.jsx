import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Safarnama</h3>
            <p>Share your journey, discover new stories, and connect with fellow travelers.</p>
            <div className="social-links">
              <Link to="#" className="social-link">
                <Facebook size={20} />
              </Link>
              <Link to="#" className="social-link">
                <Twitter size={20} />
              </Link>
              <Link to="#" className="social-link">
                <Instagram size={20} />
              </Link>
              <Link to="#" className="social-link">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/explore">Explore</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3>Legal</h3>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
              <Link to="/disclaimer">Disclaimer</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3>Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin size={16} />
                <span>123 Blog Street, Content City, ST 12345</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>info@safarnama.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Safarnama. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
