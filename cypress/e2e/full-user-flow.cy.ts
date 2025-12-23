// cypress/e2e/full-user-flow.cy.ts

export {}; // Make this a module to prevent global scope pollution

// Declare globals to satisfy TypeScript compiler
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const cy: any;
declare const expect: any;
declare const Cypress: any;

describe('Full User Lifecycle E2E', () => {
  const timestamp = Date.now();
  const residentEmail = `new_resident_${timestamp}@test.com`;
  const residentName = `Nguyen Van Test ${timestamp}`;
  const residentPhone = `09${timestamp.toString().slice(-8)}`; // Ensure 10 digits
  const password = 'password123';
  const adminEmail = 'admin@resimanage.com';
  const adminPassword = '123123';

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Registers, Admin Approves, Resident Logins, Updates Profile, and Logs out', () => {
    // ======================================================
    // STEP 1: RESIDENT REGISTRATION
    // ======================================================
    cy.log('--- STEP 1: REGISTRATION ---');
    cy.visit('/#/register');

    // 1. Fill Account Info
    cy.get('input[name="email"]').type(residentEmail);
    cy.get('input[name="phoneNumber"]').type(residentPhone);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);

    // 2. Fill Personal Info
    cy.get('input[name="fullName"]').type(residentName);
    cy.get('input[name="identityCard"]').type(`0${timestamp}`); // Mock ID Card

    // 3. Fill Address (Handling SearchableSelect logic if needed, or simple inputs if typing works)
    // Assuming SearchableSelect acts like a text input that filters options
    cy.get('input[placeholder*="Chọn Tỉnh"]').click().type('Tỉnh Đồng Nai');
    cy.contains('li', 'Tỉnh Đồng Nai').click();

    cy.get('input[placeholder*="Chọn Xã"]').click().type('Phường An Bình');
    cy.contains('li', 'Phường An Bình').click(); // Adjust based on mock data availability

    cy.get('input[name="street"]').type('123 Đường Test');
    cy.get('input[name="unit"]').type('Tổ 1');

    // 4. File Upload (Mocking file selection)
    // We target the hidden file inputs
    cy.get('input[type="file"]').first().selectFile({
      contents: Cypress.Buffer.from('front-id-image'),
      fileName: 'front.jpg',
      mimeType: 'image/jpeg',
    }, { force: true });

    cy.get('input[type="file"]').last().selectFile({
      contents: Cypress.Buffer.from('back-id-image'),
      fileName: 'back.jpg',
      mimeType: 'image/jpeg',
    }, { force: true });

    // 5. Terms
    cy.get('input[name="terms"]').check();

    // 6. Submit
    cy.contains('button', 'Đăng ký Tài khoản').click();

    // 7. Verify Pending Page
    cy.url({ timeout: 10000 }).should('include', '/registration-pending');
    cy.contains('Đăng ký thành công!').should('be.visible');

    // 8. Verify LocalStorage Data (Mock Backend)
    cy.window().then((win: any) => {
      const users = JSON.parse(win.localStorage.getItem('community_users') || '[]');
      const newUser = users.find((u: any) => u.email === residentEmail);
      expect(newUser).to.exist;
      expect(newUser.status).to.eq('pending_approval');
    });

    // ======================================================
    // STEP 2: ADMIN APPROVAL
    // ======================================================
    cy.log('--- STEP 2: ADMIN APPROVAL ---');
    
    // Login as Admin
    cy.visit('/#/login');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(adminPassword);
    cy.contains('button', 'Đăng nhập').click();

    // Verify Dashboard
    cy.url().should('not.include', '/login');
    cy.contains('Xin chào').should('be.visible');

    // Go to Approvals
    cy.visit('/#/approvals');
    cy.contains('Yêu cầu Đăng ký Chờ duyệt').should('be.visible');

    // Find User Card and Approve
    // We look for the card containing the name, then find the Approve button within it
    cy.contains(residentName)
      .parents('.bg-white') // Adjust selector to match Card container
      .within(() => {
        cy.contains('button', 'Phê duyệt').click();
      });

    // Verify Success Toast/Action
    cy.contains('Đã phê duyệt tài khoản').should('be.visible');

    // Verify LocalStorage Status Update
    cy.window().then((win: any) => {
      const users = JSON.parse(win.localStorage.getItem('community_users') || '[]');
      const approvedUser = users.find((u: any) => u.email === residentEmail);
      expect(approvedUser.status).to.eq('active');
    });

    // Logout Admin
    cy.get('header').within(() => {
        // Assuming user avatar/name triggers dropdown
        cy.get('button').first().click(); // Open dropdown if implemented, or just click logout if visible
    });
    // If logout is in dropdown:
    // cy.contains('Đăng xuất').click();
    // Or if sidebar has logout:
    cy.contains('button', 'Đăng xuất').click({ force: true });

    // ======================================================
    // STEP 3: RESIDENT LOGIN & PROFILE
    // ======================================================
    cy.log('--- STEP 3: RESIDENT LOGIN ---');

    cy.visit('/#/login');
    // Select "Cư dân" role tab
    cy.contains('button', 'Cư dân').click();

    cy.get('input[name="email"]').type(residentEmail);
    cy.get('input[name="password"]').type(password);
    cy.contains('button', 'Đăng nhập').click();

    // Verify Resident Home
    cy.url().should('include', '/community');
    cy.contains('Bảng tin Cộng đồng').should('be.visible');

    // Go to Profile
    cy.visit('/#/profile');
    cy.contains('Hồ sơ cá nhân').should('be.visible');
    
    // Check initial data
    cy.get('input[name="fullName"]').should('have.value', residentName);

    // Edit Phone Number
    const newPhone = '0987654321';
    cy.get('input[name="phoneNumber"]').clear().type(newPhone);
    
    // Save
    cy.contains('button', 'Lưu thay đổi').click();
    
    // Verify Success
    cy.contains('Cập nhật hồ sơ thành công').should('be.visible');

    // Reload to verify persistence
    cy.reload();
    cy.get('input[name="phoneNumber"]').should('have.value', newPhone);

    // ======================================================
    // STEP 4: LOGOUT
    // ======================================================
    cy.log('--- STEP 4: LOGOUT ---');
    
    cy.contains('button', 'Đăng xuất').click({ force: true }); // Sidebar logout
    
    // Verify Redirect
    cy.url().should('include', '/login');
    
    // Verify Session Cleared
    cy.window().then((win: any) => {
      expect(win.localStorage.getItem('app_jwt')).to.be.null;
    });
    
    // Attempt to access protected route
    cy.visit('/#/profile');
    cy.url().should('include', '/login');
  });
});