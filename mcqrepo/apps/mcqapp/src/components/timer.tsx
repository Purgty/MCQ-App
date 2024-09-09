import React, { useState, useEffect } from 'react';

interface TimerProps {
    initialSeconds: number;
    onTimeUp: () => void; // Callback when time is up
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp }) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    
    useEffect(() => {
        if (seconds > 0) {
            const intervalId = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds - 1);
            }, 1000);
            return () => clearInterval(intervalId); // Cleanup on unmount
        } else {
            onTimeUp(); // Call the callback when time is up
        }
    }, [seconds, onTimeUp]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        <div>
            <h1>Countdown Timer</h1>
            <p>{minutes}:{remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}</p>
        </div>
    );
};

export default Timer;
