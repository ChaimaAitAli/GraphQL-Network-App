// i18n.js
import i18next from 'i18next';
import moment from 'moment';

// Define translations
const resources = {
    en: {
        translation: {
            // User fields
            firstName: "First Name",
            lastName: "Last Name",
            email: "Email",
            phone: "Phone",
            gender: "Gender",
            dateOfBirth: "Date of Birth",

            // Post fields
            text: "Text",
            likes: "Likes",
            tags: "Tags",
            publishDate: "Publish Date",

            // Comment fields
            message: "Message",

            // Error messages
            userNotFound: "User not found",
            postNotFound: "Post not found",
            commentNotFound: "Comment not found",
            invalidUserID: "Invalid user ID format",
            invalidPostID: "Invalid post ID format",
            invalidCommentID: "Invalid comment ID format",
            missingRequiredFields: "Missing required fields: {{fields}}",
            failedToFetchUsers: "Failed to fetch users",
            failedToFetchPosts: "Failed to fetch posts",
            failedToFetchComments: "Failed to fetch comments",
            emailExists: "Email already exists",
            failedToCreateUser: "failed To Create User"
        }
    },
    fr: {
        translation: {
            // User fields
            firstName: "Prénom",
            lastName: "Nom",
            email: "Courriel",
            phone: "Téléphone",
            gender: "Genre",
            dateOfBirth: "Date de naissance",
            male: 'homme',
            female: "femme",

            // Post fields
            text: "Texte",
            likes: "J'aimes",
            tags: "Mots-clés",
            publishDate: "Date de publication",

            // Comment fields
            message: "Message",

            // Error messages
            userNotFound: "Utilisateur non trouvé",
            postNotFound: "Publication non trouvée",
            commentNotFound: "Commentaire non trouvé",
            invalidUserID: "Format d'ID utilisateur invalide",
            invalidPostID: "Format d'ID de publication invalide",
            invalidCommentID: "Format d'ID de commentaire invalide",
            missingRequiredFields: "Champs obligatoires manquants: {{fields}}",
            failedToFetchUsers: "Échec de la récupération des utilisateurs",
            failedToFetchPosts: "Échec de la récupération des publications",
            failedToFetchComments: "Échec de la récupération des commentaires",
            emailExists: "Ce courriel existe déjà",
            failedToCreateUser: "Échec de la création de l'utilisateur",

            //Pagination
            currentPage: "Page actuelle",
            totalRecords: "nombreTotal",
            totalPages: "Nombre total de pages",
            hasNextPage: "Prochaine page?",
            hasPreviousPage: "Page précédente?"
        }
    }
};

// Initialize i18next
i18next.init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    }
});

// Date format configuration
const dateFormats = {
    en: 'MM/DD/YYYY',    // US format
    fr: 'DD/MM/YYYY'     // French format
};

// Function to format dates based on locale
export const formatDate = (date, locale = 'en') => {
    if (!date) return null;
    moment.locale(locale);
    return moment(date).format(dateFormats[locale] || dateFormats.en);
};

export default i18next;