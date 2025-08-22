# Professional Verification Testing Guide

## Overview
This guide will help you test the complete professional verification system including CSV upload functionality.

## 🚀 Getting Started

### 1. Start the Application
```bash
cd /home/raizen/Documents/MIndcare/MindCare
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **H2 Database Console**: http://localhost:8080/api/h2-console

### 3. Default Admin Account
- **Email**: admin@mindcareconnect.bd
- **Password**: MindCare@Admin2025

## 📊 Test Data Setup

### Add Test Users to Database
1. Access H2 Console: http://localhost:8080/api/h2-console
2. Connection settings:
   - JDBC URL: `jdbc:h2:mem:mindcare_connect`
   - Username: `SA`
   - Password: (leave empty)
3. Copy and execute the SQL from `test_users.sql`

### Test User Accounts (Password: password123)
- **shahid.rahman@email.com** - Will apply as Psychiatrist (approve)
- **mariam.ahmed@email.com** - Will apply as Psychologist (approve)  
- **tariq.hassan@email.com** - Has pending application (reject)
- **sabina.khatun@email.com** - Will apply as Psychologist (reject)
- **rohit.das@email.com** - Regular patient (no application)

## 🧪 Testing Scenarios

### Scenario 1: Professional Application Flow
1. **Login** as `shahid.rahman@email.com` (password: password123)
2. **Navigate** to Dashboard → Apply for Professional Verification
3. **Fill Application** with:
   - Professional Type: Psychiatrist
   - BMDC Number: BMDC-TEST-001
   - Specialization: General Psychiatry
   - Experience: 5 years
   - Upload documents (any PDF files)
4. **Submit** application
5. **Check Status** at Professional Status page

### Scenario 2: Admin Review Process
1. **Login** as admin (`admin@mindcareconnect.bd`)
2. **Navigate** to Dashboard → Verify Professionals
3. **Review** pending applications
4. **Approve/Reject** applications with notes
5. **View Statistics** dashboard

### Scenario 3: CSV Upload Testing
1. **Login** as admin
2. **Navigate** to Admin Verification Dashboard
3. **Upload** the provided `pre_verified_professionals.csv` file
4. **Observe** upload status and processed count
5. **Verify** that new professional accounts are created

### Scenario 4: Status Tracking
1. **Login** as any test user who submitted application
2. **Navigate** to Professional Status page
3. **View** application details, status, and any admin notes

## 📁 Files Created

### Frontend Components
- `/professional/apply/page.js` - Application form
- `/professional/status/page.js` - Status tracking
- `/admin/verifications/page.js` - Admin dashboard

### Backend Implementation
- `ProfessionalVerificationService.java` - Business logic
- `AdminController.java` - Admin endpoints
- `ProfessionalController.java` - User endpoints

### Test Data
- `pre_verified_professionals.csv` - Sample CSV for upload
- `test_users.sql` - SQL script for test users

## 🔍 Features to Test

### ✅ Professional Application
- [ ] Form validation for different professional types
- [ ] Document upload functionality
- [ ] Application submission and correlation ID generation
- [ ] Duplicate application prevention

### ✅ Admin Management
- [ ] View all applications with filtering
- [ ] Approve applications (adds PROFESSIONAL role)
- [ ] Reject applications with reasons
- [ ] CSV upload with status feedback
- [ ] Statistics dashboard

### ✅ Status Tracking
- [ ] Real-time status updates
- [ ] View application details
- [ ] Display admin notes and rejection reasons
- [ ] Reapplication after rejection

### ✅ CSV Upload Features
- [ ] File validation (CSV only, size limits)
- [ ] Progress indication during upload
- [ ] Success/error status display
- [ ] Processed count feedback
- [ ] Auto-approval of pre-verified professionals

## 🐛 Expected Behaviors

### Success Cases
- **Valid Applications**: Should be created with PENDING status
- **Admin Approval**: Should add PROFESSIONAL role and set APPROVED status
- **CSV Upload**: Should process valid entries and show count
- **Status Updates**: Should reflect in real-time

### Error Cases
- **Duplicate Applications**: Should prevent multiple pending applications
- **Invalid CSV**: Should show error messages
- **Missing Data**: Should display validation errors
- **Unauthorized Access**: Should redirect to login

## 🔧 Troubleshooting

### Common Issues
1. **Docker Build Errors**: Ensure all files are saved and try `docker-compose down` first
2. **Database Issues**: Reset with `docker-compose down -v` to clear volumes
3. **Frontend Errors**: Check browser console for API errors
4. **Upload Failures**: Verify file format and admin authentication

### Debug Tips
- Check browser Network tab for API responses
- Monitor backend logs for detailed error messages
- Use H2 console to verify database changes
- Test API endpoints directly with curl/Postman

## 📈 Success Metrics

### Functional Requirements ✅
- [ ] Complete application workflow from submission to approval
- [ ] Admin dashboard with full management capabilities
- [ ] CSV bulk upload with feedback
- [ ] Role-based access control
- [ ] Document handling with signed URLs
- [ ] Status tracking and notifications

### Non-Functional Requirements ✅
- [ ] Responsive UI design
- [ ] Form validation and error handling
- [ ] Security with JWT authentication
- [ ] Rate limiting and file size restrictions
- [ ] Database integrity and transactions
- [ ] Logging and audit trails

## 🎯 Next Steps

After testing, consider:
1. Adding email notifications for status changes
2. Implementing document expiration and renewal
3. Adding professional profile management
4. Creating patient-professional matching system
5. Adding analytics and reporting features

---

**Happy Testing!** 🚀
