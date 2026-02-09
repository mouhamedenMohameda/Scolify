-- Vérifier si l'utilisateur existe dans la table User
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  "emailVerified",
  "isActive",
  "passwordHash" IS NOT NULL as has_password,
  "createdAt"
FROM "User"
WHERE email = 'mohameda.mouhameden@gmail.com';

-- Afficher tous les utilisateurs
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  "emailVerified",
  "isActive",
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;
