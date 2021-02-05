import React, { useState } from 'react'
import Main from './../components/Main'
import { Link } from 'react-router-dom'

const Register = ({ register }) => {

    const [user, setUser] = useState({
        email: '',
        username: '',
        password: '',
        // confirm: ''
    })


    const onChange = event => {
        setUser({
            ...user, 
            [event.target.name]: event.target.value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            register(user)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Main center={true}>
            <div className="container text-center panel panel-default">

                <div className="form-panel panel-body">
                    <h2>Register</h2>

                    <form
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                min="3"
                                max="100"
                                placeholder="Your Username..."
                                className="form-control"
                                onChange={onChange}
                                value={user.username}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                maxLength="150"
                                placeholder="Your Email..."
                                className="form-control"
                                onChange={onChange}
                                value={user.email}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Your Password..."
                                className="form-control"
                                onChange={onChange}
                                value={user.password}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm"
                                name="confirm"
                                placeholder="Please, repeat your Password..."
                                className="form-control"
                                // onChange={onChange}
                                // value={user.confirm}
                            />
                        </div>

                        <div className="from-group">
                            <input
                                type="submit"
                                className="btn btn-block btn-success"
                                value="Register"
                            />
                        </div>
                    </form>

                    <div>
                        Already has an account? 
                    <Link to="/login" className="">
                        Login
                    </Link>

                    </div>

                </div>
            </div>
        </Main>
    )
}

export default Register