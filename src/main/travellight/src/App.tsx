import {useEffect, useState} from "react";
import axios from "axios";

function App() {
    const [hello, setHello] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        axios.get('/api/test')
            .then((res) => {
                setHello(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('API 요청 오류:', err);
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            });
    }, []);
    
    return (
        <div className="App">
            {loading ? (
                <p>로딩 중...</p>
            ) : error ? (
                <p>오류: {error}</p>
            ) : (
                <p>백엔드 데이터: {hello}</p>
            )}
        </div>
    );
}

export default App;