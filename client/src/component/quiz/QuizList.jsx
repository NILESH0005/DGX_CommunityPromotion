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
                            QuizID: quiz.QuizID,  // Add QuizID here
                            group_id: quiz.group_id  // Add group_id here
                        });
                    } else {
                        acc.push({
                            id: quiz.group_name,
                            group_name: quiz.group_name,
                            group_id: quiz.group_id,  // Add group_id to the group object
                            quizzes: [{
                                id: quiz.QuizName,
                                title: quiz.QuizName,
                                questions: quiz.Total_Question_No,
                                points: quiz.MaxScore,
                                QuizID: quiz.QuizID,  // Add QuizID here
                                group_id: quiz.group_id  // Add group_id here
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
        // Only fetch quizzes if we have a token
        if (userToken) {
            fetchQuizzes();
        } else {
            setLoading(false);
            setError("Please login to access quizzes");
            // Alternatively, you could redirect to login here:
            // navigate('/login');
        }
    }, [userToken]); // 

    const handleQuizClick = (quiz, group) => {
        console.log("Passing quiz data:", {
            ...quiz,
            group_id: group.group_id,  // Use the group_id from the group object
            QuizID: quiz.QuizID  // Use the QuizID from the quiz object
        });

        navigate(`/Quiz`, {
            state: {
                quiz: {
                    ...quiz,
                    group_id: group.group_id,  // Use the group_id from the group object
                    QuizID: quiz.QuizID  // Use the QuizID from the quiz object
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
            <div className="py-12 sm:py-24 w-full">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Welcome to Quizzle!
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Test your knowledge, earn points, and compete with others to become the top performer!
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            {/* <a
                                className="rounded-md bg-DGXgreen px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
                                onClick={scrollToQuizzes}
                            >
                                Start a Quiz
                            </a> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-8/12" ref={quizCategoriesRef}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Quiz Categories</h2>
                    {quizzes.length > 0 ? (
                        quizzes.map((subject) => (
                            <div key={subject.id} className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-700 mb-6">{subject.group_name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {subject.quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="bg-white p-6 rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                                        >
                                            <h4 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h4>
                                            <p className="text-gray-600 mb-2">Questions: {quiz.questions}</p>
                                            <p className="text-gray-600 mb-4">Points: {quiz.points}</p>
                                            <button
                                                className="w-full bg-DGXblue text-white py-2 px-4 rounded-lg transition duration-200 hover:bg-blue-600"
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