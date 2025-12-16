import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../components/Header';
import '@testing-library/jest-dom';

// 1. MOCK (Fake) the Next.js Router
// We don't want to actually change pages during a test, just check if it tries to.
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Header Component', () => {
  
  beforeEach(() => {
    // Clear mocks before each test so previous tests don't interfere
    mockPush.mockClear();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders the Logo correctly', () => {
    render(<Header />);
    // Check if the text "DAILY QUIZ" is on the screen
    const logo = screen.getByText(/DAILY QUIZ/i);
    expect(logo).toBeInTheDocument();
  });

  test('shows "Hello, TestUser" when logged in', async () => {
    // 1. Fake a logged-in user in LocalStorage
    Storage.prototype.getItem = jest.fn(() => 'TestUser');

    render(<Header />);

    // 2. Wait for the useEffect to grab the username
    await waitFor(() => {
        const greeting = screen.getByText(/Hello, TestUser/i);
        expect(greeting).toBeInTheDocument();
    });
  });

  test('shows Logout button when logged in', async () => {
    Storage.prototype.getItem = jest.fn(() => 'TestUser');
    render(<Header />);

    await waitFor(() => {
        // Look for the logout button (using the title attribute we added earlier)
        const logoutBtn = screen.getByTitle('Logout');
        expect(logoutBtn).toBeInTheDocument();
    });
  });

  test('Logout button redirects to home', async () => {
    Storage.prototype.getItem = jest.fn(() => 'TestUser');
    render(<Header />);

    // Wait for button to appear
    const logoutBtn = await screen.findByTitle('Logout');
    
    // Simulate a Click
    fireEvent.click(logoutBtn);

    // Expect the router to have been called with '/'
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});