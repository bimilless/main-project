import { useState } from 'react';
import styled from 'styled-components';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import dayjs from 'dayjs';
// import { useNavigate } from 'react-router-dom';
// import signUpAPI from '../../API/signUpAPI';
import { regEmail, regPassword, regName } from '../../util/regStore';
import whiteNaver from '../../img/whiteNaver.png';
import {
  handleEmail,
  handleName,
  handleNameL,
  handlePassword,
} from '../../util/alertStore';

const Buttons = styled.button`
  background-color: rgba(20, 40, 80, 1);
  color: white;
  &:hover {
    background-color: rgba(39, 73, 109, 1);
  }
`;

const SocialButtons = styled.button`
  border-radius: 20px;
  width: 80px;
  margin-left: 10px;
  margin-top: 20px;
  &:hover {
    background-color: rgb(0, 168, 204);
  }
`;

function ModalSignUp() {
  const [signUpInfo, setSignUpInfo] = useState({
    name: '',
    email: '',
    password: '',
  });

  // eslint-disable-next-line no-unused-vars
  const [cookie, setCookie, removeCookie] = useCookies([
    'accessToken',
    'refreshToken',
  ]);
  // const naviagte = useNavigate();

  const handleInputValue = key => e => {
    setSignUpInfo({ ...signUpInfo, [key]: e.target.value });
  };

  // eslint-disable-next-line consistent-return
  const handleSignUp = e => {
    e.preventDefault();
    const { name, email, password } = signUpInfo;
    if (name.length === 0 || !regName.test(name)) {
      handleName();
      return false;
    }
    if (name.length < 2 || name.length > 15) {
      handleNameL();
      return false;
    }
    if (email.length === 0 || !regEmail.test(email)) {
      handleEmail();
      return false;
    }
    if (password.length === 0 || !regPassword.test(password)) {
      handlePassword();
      return false;
    }

    // signUpAPI(name, email, password).then(res => {
    //   if (res !== '') {
    //     window.alert('회원가입 성공!');
    //     setsignUpInfo('');
    //     setMsg(true);
    //     // naviagte('/');
    //   } else {
    //     alert('회원가입 실패');
    //   }
    // });
    // 회원가입 후 자동 로그인
    axios(
      {
        method: 'post',
        url: `${process.env.REACT_APP_API_URL}/user`,
        data: {
          name,
          email,
          password,
        },
      },
      // { withCredentials: true },
    ).then(res => {
      axios
        .post(
          `${process.env.REACT_APP_API_URL}/auth/login`,
          {
            email,
            password,
          },
          // { withCredentials: true },
          console.log(res),
        )
        // eslint-disable-next-line no-shadow
        .then(res => {
          const data = JSON.stringify({
            id: res.data.id,
            token: res.headers.authorization,
          });
          const expires = dayjs().add('40', 'm').toDate();
          setCookie('accessToken', data, { expires });
          setCookie('refreshToken', res.data.data.refreshToken);
          sessionStorage.setItem(
            'access_Token',
            res.headers.get('authorization'),
          );
          sessionStorage.setItem('user_Id', res.headers.get('userId'));
          setTimeout(() => {
            window.location.reload(true);
          }, 2000);
        })
        .catch(err => console.log(err, '회원가입'));
    });
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-outline-info"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal1"
      >
        회원가입
      </button>
      <div
        className="modal"
        id="exampleModal1"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered p-4">
          <div className="modal-content" style={{ backgroundColor: '#0c7b93' }}>
            <div className="modal-header border-bottom-0">
              <div className="col-lg-7 col-sm-12 text-lg-end text-center mt-3">
                <h1
                  className="modal-title fs-3 text-black"
                  id="exampleModalLabel"
                >
                  Sign Up
                </h1>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body p-5">
              <div className="d-flex align-items-center">
                <img
                  src={`${process.env.PUBLIC_URL}/name.svg`}
                  alt="name icon"
                  width="20"
                  height="20"
                  className="bi bi-envelope"
                />
                <input
                  type="name"
                  className="form-control border-0 border-bottom ms-3"
                  id="name"
                  placeholder="이름을 적으세요"
                  onChange={handleInputValue('name')}
                  style={{
                    borderRadius: '0',
                    paddingLeft: '5px',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              <br />
              <div className="d-flex align-items-center">
                <img
                  src={`${process.env.PUBLIC_URL}/email.svg`}
                  alt="email icon"
                  width="20"
                  height="20"
                  className="bi bi-envelope"
                />
                <input
                  type="email"
                  className="form-control border-0 border-bottom ms-3"
                  id="email"
                  placeholder="이메일을 적으세요"
                  onChange={handleInputValue('email')}
                  style={{
                    borderRadius: '0',
                    paddingLeft: '5px',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              <br />
              <div className="d-flex align-items-center">
                <img
                  src={`${process.env.PUBLIC_URL}/password.svg`}
                  alt="password icon"
                  width="20"
                  height="20"
                  className="bi bi-envelope"
                />
                <input
                  type="password"
                  className="form-control border-0 border-bottom ms-3"
                  id="password"
                  placeholder="비밀번호를 적으세요"
                  onChange={handleInputValue('password')}
                  style={{
                    borderRadius: '0',
                    paddingLeft: '5px',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              <br />
              <div className="col-lg-12 col-sm-12 text-sm-end text-center">
                <button
                  type="button"
                  className="btn btn-secondary me-3"
                  data-bs-dismiss="modal"
                >
                  취소
                </button>
                <Buttons type="submit" className="btn" onClick={handleSignUp}>
                  회원가입
                </Buttons>
              </div>
            </div>
            <div className="p-5">
              <div className="modal-body border-top d-flex gap-4 m-auto">
                <SocialButtons type="submit" className="btn btn-outline-light">
                  <img
                    src={`${process.env.PUBLIC_URL}/github.svg`}
                    alt="github icon"
                    width="20"
                    height="20"
                    className="bi bi-envelope"
                    style={{
                      marginBottom: '-4px',
                    }}
                  />
                </SocialButtons>
                <SocialButtons type="submit" className="btn btn-outline-light">
                  <img
                    src={`${process.env.PUBLIC_URL}/google.svg`}
                    alt="google icon"
                    width="19"
                    height="19"
                    className="bi bi-envelope"
                    style={{
                      marginBottom: '-4px',
                    }}
                  />
                </SocialButtons>
                <SocialButtons type="submit" className="btn btn-outline-light">
                  <img
                    src={whiteNaver}
                    alt="logo"
                    style={{
                      width: '25px',
                      height: '25px',
                      marginBottom: '-6px',
                    }}
                  />
                </SocialButtons>
              </div>
            </div>
            <div
              style={{
                padding: '0 50px 0 50px',
              }}
            >
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn border-0"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal2"
                >
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalSignUp;
