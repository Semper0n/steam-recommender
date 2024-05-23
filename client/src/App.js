import './styles/App.css';
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <BrowserRouter>
        <Header />
        <div className={"page"}>
            <AppRouter />
        </div>
        <Footer />
    </BrowserRouter>
  );
}

export default App;


