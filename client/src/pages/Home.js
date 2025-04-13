import React from 'react';

const Home = ({ tags }) => {
    return (
        <div>
            <h2>Welcome to Social Network</h2>
            <div className="card">
                <h3>Popular Tags</h3>
                <div className="tags-container">
                    {tags.map((tag, index) => (
                        <React.Fragment key={tag}>
                            <span className="tag">{tag}</span>
                            {index < tags.length - 1 && <span className="tag-separator">, </span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;