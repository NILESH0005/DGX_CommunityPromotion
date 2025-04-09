import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiContext from '../../context/ApiContext';

const QuizList = () => {
    const navigate = useNavigate();
    const quizCategoriesRef = useRef(null);
    const { userToken, fetchData } = useContext(ApiContext);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const topPerformers = [
        { id: 1, name: "John Doe", points: 1200, avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
        { id: 2, name: "Jane Smith", points: 1150, avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
        { id: 3, name: "Alice Johnson", points: 1100, avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
        { id: 4, name: "Bob Brown", points: 1050, avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
        { id: 5, name: "Charlie Davis", points: 1000, avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
    ];

    const fetchQuizzes = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!userToken) {
                throw new Error("Authentication token is missing");
            }

            const endpoint = "quiz/getUserQuizCategory";
            const method = "GET";
            const headers = {
                "Content-Type": "application/json",
                "auth-token": userToken,
            };


            const data = await fetchData(endpoint, method, {}, headers);
            console.log("data:", data)

            if (!data) {
                throw new Error("No data received from server");
            }

            if (data.success) {
                const groupedQuizzes = data.data.quizzes.reduce((acc, quiz) => {
                    const existingGroup = acc.find(group => group.group_name === quiz.group_name);

                    if (existingGroup) {
                        existingGroup.quizzes.push({
                            id: quiz.QuizName,
                            title: quiz.QuizName,
                            questions: quiz.Total_Question_No,
                            points: quiz.MaxScore,
                            QuizID: quiz.QuizID,
                            group_id: quiz.group_id,
                            image: quiz.QuizImage  
                        });
                    } else {
                        acc.push({
                            id: quiz.group_name,
                            group_name: quiz.group_name,
                            group_id: quiz.group_id,
                            quizzes: [{
                                id: quiz.QuizName,
                                title: quiz.QuizName,
                                questions: quiz.Total_Question_No,
                                points: quiz.MaxScore,
                                QuizID: quiz.QuizID,
                                group_id: quiz.group_id,
                                image: quiz.QuizImage  // Add image here
                            }]
                        });
                    }
                    return acc;
                }, []);

                setQuizzes(groupedQuizzes);
            } else {
                throw new Error(data.message || "Failed to fetch quizzes");
            }
        } catch (err) {
            console.error("Error fetching quizzes:", err);
            setError(err.message || "Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (userToken) {
            fetchQuizzes();
        } else {
            setLoading(false);
            setError("Please login to access quizzes");
            
        }
    }, [userToken]); // 

    const handleQuizClick = (quiz, group) => {
        console.log("Passing quiz data:", {
            ...quiz,
            group_id: group.group_id,  
            QuizID: quiz.QuizID  
        });

        navigate(`/Quiz`, {
            state: {
                quiz: {
                    ...quiz,
                    group_id: group.group_id, 
                    QuizID: quiz.QuizID 
                }
            }
        });
    };

    const scrollToQuizzes = () => {
        if (quizCategoriesRef.current) {
            quizCategoriesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DGXblue mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-700">Loading quizzes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <p className="text-red-500 text-lg">{error}</p>
                    <button
                        onClick={fetchQuizzes}
                        className="mt-4 bg-DGXblue text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="py-12 sm:py-6 w-full">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Welcome to Quizzle!
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Test your knowledge, earn points, and compete with others to become the top performer!
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-8/12" ref={quizCategoriesRef}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Quiz Categories</h2>
                    {quizzes.length > 0 ? (
                        quizzes.map((subject) => (
                            <div key={subject.id} className="mb-12 group">
                                <div className="relative mb-6">
                                    <h3 className="text-2xl font-bold text-gray-700 inline-block relative pb-2">{subject.group_name}
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></span>
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {subject.quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-500 group-hover:border-purple-600 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-bl-full"></div>

                                            {/* Add image section here */}
                                            {quiz.image && (
                                                <div className="mb-4 h-40 overflow-hidden rounded-lg">
                                                    <img
                                                        src={quiz.image} // Adjust the path as needed
                                                        alt={quiz.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <h4 className="text-xl font-bold text-gray-800 mb-2 relative z-10">{quiz.title}</h4>
                                            <div className="flex gap-4 mb-3 relative z-10">
                                                <span className="flex items-center text-gray-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    {quiz.questions}
                                                </span>
                                                <span className="flex items-center text-gray-600">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    {quiz.points}
                                                </span>
                                            </div>
                                            <button
                                                className="w-full bg-DGXblue text-white py-2 px-4 rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-md relative z-10"
                                                onClick={() => handleQuizClick(quiz, subject)}
                                            >
                                                Start Quiz
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No quizzes available at the moment.</p>
                        </div>
                    )}
                </div>
                <div className="w-full lg:w-4/12">
                    <div className="sticky top-6">
                        <div className="bg-white p-6 rounded-xl shadow-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Performers</h2>
                            <div className="space-y-4">
                                {topPerformers.map((user, index) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow duration-300"
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="ml-4">
                                                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.points} Points</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-lime-600">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-sm text-gray-600 text-center">
                                Top performers will be rewarded with exclusive gifts! 🎁
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizList;