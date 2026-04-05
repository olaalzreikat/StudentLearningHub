import './CallToAction.css';

function CallToAction(){
    return(
        <div className="scrolling-words-container">
            <span>Ready to Start Mastering</span>
            <div className="scrolling-words-box">
              <ul>
                <li className="math">Math</li>
                <li className="alg">Algebra</li>
                <li className="geo">Geometry</li>
                <li className="calc">Calculus</li>
                <li className="stats">Statistics</li>
                <li className="math">Math</li>
              </ul>
            </div>
        </div>
    );
}
export default CallToAction;