import * as express from "express";
import axios from "axios";
import * as firebaseAdmin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseSdkConfig, api_key, port } from "../config.json";

// Initialize FirebaseApp with service-account.json
if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(firebaseSdkConfig as firebaseAdmin.ServiceAccount),
    });
}

enum Role {
    NAVER = "naver",
    KAKAO = "kakao",
}

function getApiKey(site: Role) {
    if (site === Role.KAKAO) {
        return {
            URL: "https://kauth.kakao.com/oauth/token",
            CLIENT_ID: api_key.kakao.client_id,
            CLIENT_SECRET: api_key.kakao.clent_secret,
            REDIRECT_URL: api_key.kakao.redirect_url,
        };
    }
    if (site === Role.NAVER) {
        return {
            URL: "https://nid.naver.com/oauth2.0/token",
            CLIENT_ID: api_key.naver.client_id,
            CLIENT_SECRET: api_key.naver.clent_secret,
            REDIRECT_URL: api_key.naver.redirect_url,
        };
    }
}

async function getAccessToken(site: Role, code: string | null, state?: string | null) {
    const API_KEY = getApiKey(site);
    if (API_KEY) {
        try {
            const {
                data: { access_token }, // 구조 분해 할당을 통해 access_token 값만 추출
            } = await axios({
                url: API_KEY.URL,
                method: "post",
                params: {
                    grant_type: "authorization_code",
                    client_id: API_KEY.CLIENT_ID,
                    client_secret: API_KEY.CLIENT_SECRET,
                    redirect_uri: API_KEY.REDIRECT_URL,
                    code: code,
                    state: state,
                },
            });
            return access_token;
        } catch (err) {
            console.log(err);
        }
    }
}

/**
 * getUserInfo - Returns user profile from Kakao API
 *
 * @param  {String} accessToken Access token retrieved by Kakao Login API
 * @return {Promiise<Response>}      User profile response in a promise
 */
function getUserInfo(site: Role, accessToken: string) {
    let URL;
    if (site === Role.KAKAO) {
        URL = "https://kapi.kakao.com/v2/user/me";
    }
    if (site === Role.NAVER) {
        URL = "https://openapi.naver.com/v1/nid/me";
    }
    console.log("Requesting user profile from Kakao API server.");
    return axios({
        method: "GET",
        headers: { Authorization: "Bearer " + accessToken },
        url: URL,
    });
}

/**
 * updateOrCreateUser - Update Firebase user with the give email, create if
 * none exists.
 *
 * @param  {String} userId        user id per app
 * @param  {String} email         user's email address
 * @param  {String} displayName   user
 * @param  {String} photoURL      profile photo url
 * @return {Prommise<UserRecord>} Firebase user record in a promise
 */

interface UpdateParams {
    displayName: string;
    emailVerified: boolean;
    photoURL?: string;
    uid?: string;
    email?: string;
}

function updateOrCreateUser(userId: string, email: string, displayName: string, photoURL?: string) {
    const updateParams: UpdateParams = {
        displayName: displayName,
        emailVerified: true,
    };
    if (displayName) {
        updateParams["displayName"] = displayName;
    } else {
        updateParams["displayName"] = email;
    }
    if (photoURL) {
        updateParams["photoURL"] = photoURL;
    }
    return firebaseAdmin
        .auth()
        .updateUser(userId, updateParams)
        .catch(async (error) => {
            if (error.code === "auth/user-not-found") {
                updateParams["uid"] = userId;
                if (email) {
                    updateParams["email"] = email;
                }
                // 나중에 회원관리를 쉽게 하게끔 doc id를 uid로 저장
                const db = getFirestore();
                const docRef = db.collection("users").doc(updateParams.uid);

                await docRef.set({
                    name: updateParams.displayName,
                    email: updateParams.email,
                    photoURL: updateParams.photoURL,
                    uid: updateParams.uid,
                    currentPoint: 0,
                    totalPoint: 0,
                    createdAt: Date.now(),
                });

                return firebaseAdmin.auth().createUser(updateParams); // 신규 유저 생성
            }
            throw error;
        });
}

/**
 * createFirebaseToken - returns Firebase token using Firebase Admin SDK
 *
 * @param  {String} accessToken access token from Kakao Login API
 * @return {Promise<String>}                  Firebase token in a promise
 */
async function createFirebaseToken(site: Role, accessToken: string) {
    return await getUserInfo(site, accessToken)
        .then((response) => {
            const body = response.data;
            let userId = "";
            let nickname = "";
            let profileImage = "";
            let email = "";

            if (site === Role.KAKAO) {
                email = body.kakao_account.email;
                userId = `${site}:${body.id}`;
                if (body.properties) {
                    nickname = body.properties.nickname;
                    profileImage = body.properties.profile_image;
                }
            }
            if (site === Role.NAVER) {
                nickname = body.response.name;
                profileImage = body.response.profile_image;
                email = body.response.email;
                userId = `${site}:${body.response.id}`;
            }

            if (!userId) {
                // return res.status(404).send({
                //     message: "There was no user with the given access token.",
                // });
                console.log("There was no user with the given access token.");
            }

            return updateOrCreateUser(userId, email, nickname, profileImage);
        })
        .then((userRecord) => {
            const userId = userRecord.uid;
            // console.log(`creating a custom firebase token based on uid ${userId}`);
            return firebaseAdmin.auth().createCustomToken(userId);
        });
}

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/oauth/kakao", async (req, res) => {
    const { code } = req.body;
    const access_token = await getAccessToken(Role.KAKAO, code);
    if (!access_token) return res.status(400).send({ error: "There is no token." }).send({ message: "Access token is a required parameter." });
    createFirebaseToken(Role.KAKAO, access_token).then((firebaseToken) => {
        res.send({ result: firebaseToken });
    });
});

app.post("/oauth/naver", async (req, res) => {
    const { code, state } = req.body;
    const access_token = await getAccessToken(Role.NAVER, code, state);
    if (!access_token) return res.status(400).send({ error: "There is no token." }).send({ message: "Access token is a required parameter." });
    createFirebaseToken(Role.NAVER, access_token).then((firebaseToken) => {
        res.send({ result: firebaseToken });
    });
});

app.listen(port, () => {
    console.log("server is running!");
});
