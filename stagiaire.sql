-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : ven. 30 mai 2025 à 07:58
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `stagiaire`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telephone` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `admin`
--

INSERT INTO `admin` (`id`, `login`, `password`, `telephone`) VALUES
(1, 'elis@gmail.com', '$2b$10$AcXn4fZ05PGHFzitPK6JLe7Ps2jXIfWsELMGQKnEEaT5Vj0Yk98o6', '0639779717'),
(2, 'elis37198@gmail.com', '$2b$10$Pqid2HyB47WSEKwzEGxRw.OmiT9WULgLtoSFwW80NYk9tDKrW0J5O', '0639004914'),
(3, 'selimthouaibat9@gmail.com', '$2b$10$BDUZDryvkeuHKReQQ/.NkOn4JONpNT/.bhG2ARcMCM29MvtsOpBRS', '0639579501');

-- --------------------------------------------------------

--
-- Structure de la table `horaires`
--

DROP TABLE IF EXISTS `horaires`;
CREATE TABLE IF NOT EXISTS `horaires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jour` varchar(20) NOT NULL,
  `type` enum('public','rdv') NOT NULL,
  `ouverture` time DEFAULT NULL,
  `fermeture` time DEFAULT NULL,
  `commentaire` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `horaires`
--

INSERT INTO `horaires` (`id`, `jour`, `type`, `ouverture`, `fermeture`, `commentaire`) VALUES
(1, 'Lundi', 'public', '08:00:00', '13:00:00', NULL),
(2, 'Lundi', 'public', '14:30:00', '17:30:00', NULL),
(3, 'Mardi', 'rdv', '08:00:00', '12:00:00', 'Sur rendez-vous'),
(4, 'Mardi', 'rdv', '14:00:00', '16:30:00', 'Sur rendez-vous'),
(5, 'Mercredi', 'rdv', '08:00:00', '12:00:00', 'Sur rendez-vous'),
(6, 'Mercredi', 'rdv', '14:00:00', '16:30:00', 'Sur rendez-vous'),
(7, 'Jeudi', 'rdv', '08:00:00', '12:00:00', 'Sur rendez-vous'),
(8, 'Jeudi', 'rdv', '14:00:00', '16:30:00', 'Sur rendez-vous'),
(9, 'Vendredi', 'public', '08:00:00', '11:30:00', NULL),
(10, 'Samedi', 'public', '08:00:00', '12:00:00', NULL),
(11, 'Dimanche', 'public', NULL, NULL, 'Fermé');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
