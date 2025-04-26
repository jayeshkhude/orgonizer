# Organizer.co

A modern web application for organizing and managing your files efficiently.

## Features

- Video organization with timestamp-based sorting
- Secure access control
- Modern UI with smooth animations
- Responsive design
- File upload and management
- Custom folder creation

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- JSZip

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/organizer.co.git
cd organizer.co
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your project to Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy!

### Manual Deployment

1. Build the project:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Security

- Content Security Policy (CSP) implemented
- Secure HTTP headers
- Input validation
- Access control
- Environment variable protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 