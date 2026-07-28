package com.grod.platform.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grod.platform.dto.PasskeyAuthenticationDTO;
import com.grod.platform.dto.PasskeyRegistrationDTO;
import com.grod.platform.entity.AdminPasskeyCredential;
import com.grod.platform.entity.Utilisateur;
import com.grod.platform.repository.AdminPasskeyCredentialRepository;
import com.grod.platform.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.interfaces.ECPublicKey;
import java.security.spec.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class WebAuthnService {

    private static final String RP_ID = "localhost";
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final AdminPasskeyCredentialRepository credentialRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, String> challenges = new ConcurrentHashMap<>();

    public Map<String, Object> startRegistration(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        String challenge = newChallenge("register:" + email);

        return Map.of(
                "challenge", challenge,
                "rp", Map.of("name", "G-ROD Admin", "id", RP_ID),
                "user", Map.of(
                        "id", encode(email.getBytes(StandardCharsets.UTF_8)),
                        "name", utilisateur.getEmail(),
                        "displayName", utilisateur.getNomComplet()
                ),
                "pubKeyCredParams", List.of(Map.of("type", "public-key", "alg", -7)),
                "timeout", 60000,
                "attestation", "none",
                "authenticatorSelection", Map.of(
                        "authenticatorAttachment", "platform",
                        "userVerification", "required"
                )
        );
    }

    public void finishRegistration(String email, PasskeyRegistrationDTO request) {
        JsonNode clientData = readClientData(request.getClientDataJSON(), "webauthn.create");
        consumeChallenge("register:" + email, clientData.get("challenge").asText());

        RegistrationData registrationData = parseAttestationObject(decode(request.getAttestationObject()));
        if (!request.getCredentialId().equals(encode(registrationData.credentialId()))) {
            throw new IllegalArgumentException("Identifiant passkey invalide");
        }

        credentialRepository.save(AdminPasskeyCredential.builder()
                .email(email)
                .credentialId(request.getCredentialId())
                .publicKeyCose(encode(registrationData.publicKeyCose()))
                .signCount(registrationData.signCount())
                .active(true)
                .build());
    }

    public Map<String, Object> startLogin(String email) {
        List<AdminPasskeyCredential> credentials = credentialRepository.findByEmailAndActiveTrue(email);
        if (credentials.isEmpty()) {
            throw new IllegalArgumentException("Aucune connexion Face ID n'est activee pour ce compte");
        }

        String challenge = newChallenge("login:" + email);

        return Map.of(
                "challenge", challenge,
                "timeout", 60000,
                "userVerification", "required",
                "allowCredentials", credentials.stream()
                        .map(credential -> Map.of(
                                "type", "public-key",
                                "id", credential.getCredentialId()
                        ))
                        .toList()
        );
    }

    public Map<String, Object> finishLogin(PasskeyAuthenticationDTO request) {
        AdminPasskeyCredential credential = credentialRepository
                .findByCredentialIdAndActiveTrue(request.getCredentialId())
                .orElseThrow(() -> new IllegalArgumentException("Passkey introuvable"));

        JsonNode clientData = readClientData(request.getClientDataJSON(), "webauthn.get");
        consumeChallenge("login:" + credential.getEmail(), clientData.get("challenge").asText());

        byte[] authenticatorData = decode(request.getAuthenticatorData());
        byte[] clientDataHash = sha256(decode(request.getClientDataJSON()));
        byte[] signedData = concat(authenticatorData, clientDataHash);
        PublicKey publicKey = coseToPublicKey(decode(credential.getPublicKeyCose()));

        try {
            Signature signature = Signature.getInstance("SHA256withECDSA");
            signature.initVerify(publicKey);
            signature.update(signedData);
            if (!signature.verify(decode(request.getSignature()))) {
                throw new IllegalArgumentException("Signature Face ID invalide");
            }
        } catch (GeneralSecurityException exception) {
            throw new IllegalArgumentException("Signature Face ID invalide", exception);
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(credential.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        return Map.of(
                "token", jwtService.generateToken(utilisateur),
                "type", "Bearer",
                "expiresIn", jwtService.getExpirationMs(),
                "email", utilisateur.getEmail(),
                "nomComplet", utilisateur.getNomComplet(),
                "role", utilisateur.getRole()
        );
    }

    private String newChallenge(String key) {
        byte[] challenge = new byte[32];
        secureRandom.nextBytes(challenge);
        String encoded = encode(challenge);
        challenges.put(key, encoded);
        return encoded;
    }

    private void consumeChallenge(String key, String actualChallenge) {
        String expectedChallenge = challenges.remove(key);
        if (expectedChallenge == null || !expectedChallenge.equals(actualChallenge)) {
            throw new IllegalArgumentException("Challenge Face ID invalide");
        }
    }

    private JsonNode readClientData(String clientDataJSON, String expectedType) {
        try {
            JsonNode clientData = objectMapper.readTree(decode(clientDataJSON));
            if (!expectedType.equals(clientData.get("type").asText())) {
                throw new IllegalArgumentException("Type WebAuthn invalide");
            }
            return clientData;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Donnees WebAuthn invalides", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private RegistrationData parseAttestationObject(byte[] attestationObject) {
        Map<Object, Object> attestation = (Map<Object, Object>) new CborReader(attestationObject).read();
        byte[] authData = (byte[]) attestation.get("authData");
        int signCount = ByteBuffer.wrap(authData, 33, 4).getInt();
        int credentialIdLength = ((authData[53] & 0xff) << 8) | (authData[54] & 0xff);
        byte[] credentialId = Arrays.copyOfRange(authData, 55, 55 + credentialIdLength);
        byte[] coseKey = Arrays.copyOfRange(authData, 55 + credentialIdLength, authData.length);
        return new RegistrationData(credentialId, coseKey, signCount);
    }

    @SuppressWarnings("unchecked")
    private PublicKey coseToPublicKey(byte[] coseKey) {
        Map<Object, Object> key = (Map<Object, Object>) new CborReader(coseKey).read();
        byte[] x = (byte[]) key.get(-2L);
        byte[] y = (byte[]) key.get(-3L);

        try {
            AlgorithmParameters parameters = AlgorithmParameters.getInstance("EC");
            parameters.init(new ECGenParameterSpec("secp256r1"));
            ECParameterSpec ecParameterSpec = parameters.getParameterSpec(ECParameterSpec.class);
            ECPoint point = new ECPoint(new BigInteger(1, x), new BigInteger(1, y));
            return KeyFactory.getInstance("EC").generatePublic(new ECPublicKeySpec(point, ecParameterSpec));
        } catch (GeneralSecurityException exception) {
            throw new IllegalArgumentException("Cle publique Face ID invalide", exception);
        }
    }

    private byte[] sha256(byte[] value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private String encode(byte[] value) {
        return ENCODER.encodeToString(value);
    }

    private byte[] decode(String value) {
        return DECODER.decode(value);
    }

    private byte[] concat(byte[] first, byte[] second) {
        byte[] result = Arrays.copyOf(first, first.length + second.length);
        System.arraycopy(second, 0, result, first.length, second.length);
        return result;
    }

    private record RegistrationData(byte[] credentialId, byte[] publicKeyCose, long signCount) {
    }

    private static class CborReader {
        private final byte[] data;
        private int index;

        CborReader(byte[] data) {
            this.data = data;
        }

        Object read() {
            int initial = data[index++] & 0xff;
            int major = initial >> 5;
            long length = readLength(initial & 0x1f);

            return switch (major) {
                case 0 -> length;
                case 1 -> -1L - length;
                case 2 -> readBytes((int) length);
                case 3 -> new String(readBytes((int) length), StandardCharsets.UTF_8);
                case 4 -> readArray((int) length);
                case 5 -> readMap((int) length);
                default -> throw new IllegalArgumentException("Format CBOR non supporte");
            };
        }

        private List<Object> readArray(int length) {
            List<Object> values = new ArrayList<>();
            for (int i = 0; i < length; i++) {
                values.add(read());
            }
            return values;
        }

        private Map<Object, Object> readMap(int length) {
            Map<Object, Object> values = new LinkedHashMap<>();
            for (int i = 0; i < length; i++) {
                values.put(read(), read());
            }
            return values;
        }

        private byte[] readBytes(int length) {
            byte[] value = Arrays.copyOfRange(data, index, index + length);
            index += length;
            return value;
        }

        private long readLength(int value) {
            if (value < 24) {
                return value;
            }
            if (value == 24) {
                return data[index++] & 0xff;
            }
            if (value == 25) {
                return ((data[index++] & 0xff) << 8) | (data[index++] & 0xff);
            }
            if (value == 26) {
                return ((long) (data[index++] & 0xff) << 24)
                        | ((long) (data[index++] & 0xff) << 16)
                        | ((long) (data[index++] & 0xff) << 8)
                        | (data[index++] & 0xff);
            }
            throw new IllegalArgumentException("Longueur CBOR non supportee");
        }
    }
}
