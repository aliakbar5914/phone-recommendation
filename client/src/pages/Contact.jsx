import { useState } from 'react';
import styles from './Contact.module.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSent(true);
  };

  return (
    <div className={styles.contact}>
      <div className={styles.container}>
        <div className="page-header">
          <h1>Contact Us</h1>
          <p>Have a question or feedback? We'd love to hear from you.</p>
        </div>

        {sent ? (
          <div className={styles.successCard}>
            <span className={styles.successIcon} aria-hidden="true" />
            <h2>Message Sent!</h2>
            <p>Thank you for reaching out. We'll get back to you soon.</p>
            <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
              Send Another
            </button>
          </div>
        ) : (
          <div className={styles.card}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }} placeholder="Your name" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }} placeholder="you@example.com" />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input value={form.subject} onChange={e => { setForm(p => ({ ...p, subject: e.target.value })); setErrors(p => ({ ...p, subject: '' })); }} placeholder="What's this about?" />
                {errors.subject && <div className="form-error">{errors.subject}</div>}
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows={5} value={form.message} onChange={e => { setForm(p => ({ ...p, message: e.target.value })); setErrors(p => ({ ...p, message: '' })); }} placeholder="Your message..." />
                {errors.message && <div className="form-error">{errors.message}</div>}
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>Send Message</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
