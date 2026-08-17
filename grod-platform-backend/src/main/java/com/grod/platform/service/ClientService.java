package com.grod.platform.service;

import com.grod.platform.dto.ClientDetailDTO;
import com.grod.platform.dto.ClientListDTO;
import com.grod.platform.entity.Client;

import java.util.List;

public interface ClientService {
    Client trouverOuCreer(String nom, String societe, String email, String telephone);
    List<ClientListDTO> listerClients();
    ClientDetailDTO trouverClient(Long id);
    int rattacherDemandesExistantes();
}
