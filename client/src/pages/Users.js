import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int) {
    users(page: $page, limit: $limit) {
      data {
        id
        firstName
        lastName
        email
      }
      pagination {
        totalRecords
        currentPage
        totalPages
      }
    }
  }
`;

const Users = () => {
    const [page, setPage] = useState(1);
    const limit = 5;

    const { loading, error, data } = useQuery(GET_USERS, {
        variables: { page, limit }
    });

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const { users } = data;

    return (
        <div>
            <h2>Users</h2>
            <div>
                {users.data.map(user => (
                    <div key={user.id} className="card">
                        <h3 style={{ color: "blue" }}>{user.firstName} {user.lastName}</h3>
                        <p> <span style={{ fontWeight: "bold" }}>Email:</span> {user.email}</p>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button style={{ marginRight: "5px" }}
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span>Page {users.pagination.currentPage} of {users.pagination.totalPages}</span>
                <button style={{ marginLeft: "5px" }}
                    disabled={page === users.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Users;