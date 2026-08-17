CREATE TABLE utilisateurs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM ('ADMIN', 'COMMERCIAL') NOT NULL,
    actif BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilisateurs_email UNIQUE (email)
);

CREATE TABLE admin_passkey_credentials (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    credential_id VARCHAR(500) NOT NULL,
    public_key_cose ${textLobType} NOT NULL,
    sign_count BIGINT NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_passkey_credential_id UNIQUE (credential_id)
);

CREATE TABLE app_settings (
    setting_key VARCHAR(255) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    PRIMARY KEY (setting_key)
);

CREATE TABLE produits (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    categorie VARCHAR(255),
    image_url VARCHAR(255),
    applications VARCHAR(1000),
    dimensions VARCHAR(255),
    purete VARCHAR(255),
    normes VARCHAR(255),
    conditionnement VARCHAR(255),
    actif BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_produit_actif (actif),
    INDEX idx_produit_categorie (categorie)
);

CREATE TABLE clients (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    societe VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(255) NOT NULL,
    actif BOOLEAN NOT NULL,
    date_creation DATETIME(6),
    date_miseajour DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_clients_email UNIQUE (email)
);

CREATE TABLE demandes_devis (
    id BIGINT NOT NULL AUTO_INCREMENT,
    reference_demande VARCHAR(255),
    societe VARCHAR(255) NOT NULL,
    nom_contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(255) NOT NULL,
    produit_demande VARCHAR(255) NOT NULL,
    produit_id BIGINT,
    client_id BIGINT,
    purete_cuivre DOUBLE,
    longueur DOUBLE,
    largeur DOUBLE,
    epaisseur DOUBLE,
    quantite INT NOT NULL,
    besoin_livraison VARCHAR(255),
    application_projet VARCHAR(1000),
    finition_souhaitee VARCHAR(255),
    norme_reference VARCHAR(255),
    lien_plan_technique VARCHAR(1000),
    diametre_souhaite VARCHAR(255),
    client_fidele BOOLEAN NOT NULL,
    reference_client VARCHAR(255),
    message VARCHAR(2000),
    fichier_technique_url VARCHAR(255),
    fichier_technique_nom VARCHAR(255),
    statut ENUM ('NOUVELLE', 'EN_TRAITEMENT', 'TRAITEE', 'ANNULEE'),
    date_creation DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_devis_reference UNIQUE (reference_demande),
    CONSTRAINT fk_devis_client FOREIGN KEY (client_id) REFERENCES clients (id),
    INDEX idx_devis_statut_date (statut, date_creation),
    INDEX idx_devis_email (email)
);

CREATE TABLE demandes_documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    reference_demande VARCHAR(255),
    societe VARCHAR(255) NOT NULL,
    nom_contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(255) NOT NULL,
    type_document VARCHAR(255) NOT NULL,
    titre_document VARCHAR(255) NOT NULL,
    produit_concerne VARCHAR(255),
    message VARCHAR(2000),
    statut ENUM ('NOUVELLE', 'EN_TRAITEMENT', 'TRAITEE', 'ANNULEE'),
    date_creation DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_document_request_reference UNIQUE (reference_demande),
    INDEX idx_document_request_statut_date (statut, date_creation),
    INDEX idx_document_request_type (type_document)
);

CREATE TABLE documents_techniques (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titre VARCHAR(255) NOT NULL,
    type_document VARCHAR(255) NOT NULL,
    produit_concerne VARCHAR(255),
    description VARCHAR(1000),
    fichier_url VARCHAR(255) NOT NULL,
    fichier_nom VARCHAR(255) NOT NULL,
    actif BOOLEAN NOT NULL,
    telechargement_public BOOLEAN NOT NULL,
    date_creation DATETIME(6),
    PRIMARY KEY (id),
    INDEX idx_resource_actif_public (actif, telechargement_public),
    INDEX idx_resource_type (type_document)
);

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    type ENUM ('NOUVELLE_DEMANDE_DEVIS', 'NOUVELLE_DEMANDE_DOCUMENT') NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    reference_type ENUM ('DEVIS', 'DOCUMENT') NOT NULL,
    reference_id BIGINT NOT NULL,
    reference_code VARCHAR(255),
    client_id BIGINT,
    date_creation DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_notification_date (date_creation),
    INDEX idx_notification_type_reference (type, reference_type)
);

CREATE TABLE notification_lectures (
    id BIGINT NOT NULL AUTO_INCREMENT,
    notification_id BIGINT NOT NULL,
    utilisateur_id BIGINT NOT NULL,
    date_lecture DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_notification_lecture UNIQUE (notification_id, utilisateur_id),
    CONSTRAINT fk_notification_lecture_notification FOREIGN KEY (notification_id) REFERENCES notifications (id),
    CONSTRAINT fk_notification_lecture_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id)
);
