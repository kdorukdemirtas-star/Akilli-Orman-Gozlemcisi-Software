import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="board">
          <h1>Sayfa açılamadı</h1>
          <p role="alert">Bir hata oluştu.</p>
          <button type="button" className="hit" onClick={() => location.reload()}>
            Yeniden dene
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
