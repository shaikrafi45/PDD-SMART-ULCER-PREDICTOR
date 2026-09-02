import bcrypt from 'bcryptjs';
import allHistory from './all_history.json';

// Pre-seeded verified accounts from the application database (smart_ulcer_db)
export const SEED_USERS = [
    {
        id: 1,
        name: "Lakesh",
        email: "lakesh.bille.14@gmail.com",
        passwordHash: "$2y$10$JX/VWPz3tkP4UOjwJIoqhu87sfc20mWZpnN.N5vin8AgiqMQye/8O"
    },
    {
        id: 2,
        name: "rafi",
        email: "rafiii96322@gmail.com",
        passwordHash: "$2y$10$wnZOwzAq3VvALwMjhd2Eb.lDsoZFw5TtDLgjMs804rkD9EYS1PAGy"
    },
    {
        id: 3,
        name: "exam",
        email: "examexam0011@gmail.com",
        passwordHash: "$2y$10$z7UrnKRvvieX8OdByxOu3eZoZsfzdhfsN7gdhGxwyZZ8GrrVzSISC"
    },
    {
        id: 4,
        name: "balaji",
        email: "garlapati.balaji2005@gmail.com",
        passwordHash: "$2y$10$I0gX9GCWl5..fpM4Q3KsX.hMqLp7scD/xMWj6fIDFCfC4vSKipaUi"
    },
    {
        id: 5,
        name: "poori",
        email: "dandupoornima2247.sse@saveetha.com",
        passwordHash: "$2y$10$9uVFy40k2B6crFAOEplOL.ZIuMDtLOGrYVsEMjbK9m9mUIqD2xu4i"
    },
    {
        id: 6,
        name: "rafi",
        email: "poornimad2247.sse@saveetha.com",
        passwordHash: "$2y$10$bc.tT0vbP0FNV28x5rLptOcZZY5FW3XePyJookbRJq0WCvtEcCYmG"
    },
    {
        id: 7,
        name: "Shaik Mohammad Rafi",
        email: "shaikmohammadrafi5075.sse@saveetha.com",
        passwordHash: "$2y$10$rTwQAL4IHU9Al2rrJ6XzROGKdInrPG6OORGOjzRsG1CVc0PwEbUGa"
    },
    {
        id: 8,
        name: "rafi",
        email: "ooneplus1122@gmail.com",
        passwordHash: "$2y$10$Rbdu90sT0I8TCnaS1CdzxOitijPy92YMF.AiCG/wIxMVseB/bv6be"
    },
    {
        id: 9,
        name: "Test Userbh",
        email: "testuser@exaemple.combbdb",
        passwordHash: "$2y$10$lvE4khoFFlExA2JxxZ0cd..e0wWTcV38Hf2.aZL4HPNxsJWEqGagy"
    },
    {
        id: 10,
        name: "Layna",
        email: "layna4115@gmail.com",
        passwordHash: "$2y$10$jk3jeQ/.SlT0zwj6Vvg2BOzB1mgqDv6oBvu1QnwWb/Xj6JO4qFb/6"
    }
];

export const SEED_HISTORY = allHistory;

/**
 * Initializes localStorage with synced accounts and complete history
 */
export function initializeSyncedStore() {
    try {
        const storedUsers = localStorage.getItem('synced_users');
        if (!storedUsers) {
            localStorage.setItem('synced_users', JSON.stringify(SEED_USERS));
        } else {
            const users = JSON.parse(storedUsers);
            let updated = false;
            for (const seed of SEED_USERS) {
                if (!users.some(u => (u.email || '').toLowerCase() === (seed.email || '').toLowerCase())) {
                    users.push(seed);
                    updated = true;
                }
            }
            if (updated) {
                localStorage.setItem('synced_users', JSON.stringify(users));
            }
        }

        const storedHistory = localStorage.getItem('synced_history');
        if (!storedHistory) {
            localStorage.setItem('synced_history', JSON.stringify(SEED_HISTORY));
        } else {
            const history = JSON.parse(storedHistory);
            let updated = false;
            for (const seed of SEED_HISTORY) {
                if (!history.some(h => String(h.id) === String(seed.id))) {
                    history.push(seed);
                    updated = true;
                }
            }
            if (updated) {
                history.sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0));
                localStorage.setItem('synced_history', JSON.stringify(history));
            }
        }
    } catch (e) {
        console.error("Failed to initialize synced storage", e);
    }
}

/**
 * Checks a user's credentials against the synced store.
 */
export function authenticateUser(email, password) {
    initializeSyncedStore();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const storedUsers = JSON.parse(localStorage.getItem('synced_users') || '[]');
    const user = storedUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);

    if (!user) {
        return { success: false, message: 'Email not found in registered accounts.' };
    }

    if (user.password && user.password === cleanPassword) {
        return {
            success: true,
            user: { id: user.id, name: user.name, email: user.email }
        };
    }

    if (user.passwordHash) {
        try {
            const formattedHash = user.passwordHash.replace(/^\$2y\$/, '$2a$');
            if (bcrypt.compareSync(cleanPassword, formattedHash)) {
                return {
                    success: true,
                    user: { id: user.id, name: user.name, email: user.email }
                };
            }
        } catch (err) {
            console.warn("Bcrypt comparison error:", err);
        }
    }

    return { success: false, message: 'Incorrect password. Please try again.' };
}

/**
 * Registers a new user into the synced local database.
 */
export function registerUser(name, email, password) {
    initializeSyncedStore();
    const cleanEmail = (email || '').trim().toLowerCase();
    const storedUsers = JSON.parse(localStorage.getItem('synced_users') || '[]');

    if (storedUsers.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
        return { success: false, message: 'Email is already registered.' };
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
        id: storedUsers.length > 0 ? Math.max(...storedUsers.map(u => u.id)) + 1 : 1,
        name: name.trim(),
        email: cleanEmail,
        password: password,
        passwordHash: passwordHash
    };

    storedUsers.push(newUser);
    localStorage.setItem('synced_users', JSON.stringify(storedUsers));

    return {
        success: true,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
    };
}

/**
 * Resets a user's password in the synced store.
 */
export function resetPassword(email, newPassword) {
    initializeSyncedStore();
    const cleanEmail = (email || '').trim().toLowerCase();
    const storedUsers = JSON.parse(localStorage.getItem('synced_users') || '[]');
    const userIndex = storedUsers.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);

    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    storedUsers[userIndex].password = newPassword;
    storedUsers[userIndex].passwordHash = passwordHash;
    localStorage.setItem('synced_users', JSON.stringify(storedUsers));

    return { success: true, message: 'Password reset successful!' };
}

/**
 * Gets history records for a specific user.
 */
export function getUserHistory(userId) {
    initializeSyncedStore();
    const storedHistory = JSON.parse(localStorage.getItem('synced_history') || '[]');
    const numericId = parseInt(userId, 10);

    const userHistory = storedHistory.filter(h => {
        const itemUserId = parseInt(h.user_id, 10);
        return itemUserId === numericId;
    });

    if (userHistory.length > 0) {
        return userHistory;
    }

    // If specific user has no scans yet, fallback to all historical scans so screen is populated
    return storedHistory;
}

/**
 * Adds an analysis history entry for a user.
 */
export function addHistoryRecord(userId, result, confidence, imageBase64OrUrl) {
    initializeSyncedStore();
    const storedHistory = JSON.parse(localStorage.getItem('synced_history') || '[]');
    const newRecord = {
        id: Date.now(),
        user_id: parseInt(userId, 10) || 1,
        result: result,
        confidence: typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0,
        image_path: imageBase64OrUrl || "assets/app_logo.png",
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    storedHistory.unshift(newRecord);
    localStorage.setItem('synced_history', JSON.stringify(storedHistory));
    return newRecord;
}
