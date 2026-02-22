import React,{useState,useEffect} from 'react'
import axiosInstance from '../utils/axiosInstance';

const RegiteredUsers = () => {
    const [users, setUsers] = useState([]);
      const [papers, setPapers] = useState([]);
      const [reviewers, setReviewers] = useState([]);



  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, papersRes, reviewersRes] = await Promise.all([
          axiosInstance.get("/admin/users"),
          axiosInstance.get("/admin/papers"),
          axiosInstance.get("/admin/reviewers"),
        ]);

        setUsers(usersRes.data);
        setPapers(papersRes.data);
        setReviewers(reviewersRes.data);
        console.log("pap  ",papersRes.data)
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  return (
    <div className='p-6'>
       <table className="w-full text-md p-6">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

export default RegiteredUsers
