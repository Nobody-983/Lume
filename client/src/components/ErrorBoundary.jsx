import { Component } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './Button.jsx';
import { Logo } from './Logo.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Lumé render error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <Logo />
          <p className="eyebrow">A small interruption</p>
          <h1>This page lost its thread.</h1>
          <p>
            Your saved planner is still in this browser. Reload to return to Lumé; if the problem
            continues, restart the app.
          </p>
          <Button icon={RotateCcw} onClick={() => window.location.reload()}>
            Reload Lumé
          </Button>
        </main>
      );
    }

    return this.props.children;
  }
}
