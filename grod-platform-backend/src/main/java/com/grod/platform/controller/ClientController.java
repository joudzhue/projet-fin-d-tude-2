package com.grod.platform.controller;

import com.grod.platform.dto.ClientDetailDTO;
import com.grod.platform.dto.ClientListDTO;
import com.grod.platform.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.grod.platform.dto.PagedResponse;
import com.grod.platform.service.AdminPaginationService;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/clients")
@RequiredArgsConstructor
public class ClientController {
    private final ClientService clientService;
    private final AdminPaginationService paginationService;

    @GetMapping
    public PagedResponse<ClientListDTO> listerClients(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="dateMiseAJour") String sort, @RequestParam(defaultValue="desc") String direction,
            @RequestParam(required=false) String search, @RequestParam(required=false) Boolean actif,
            @RequestParam(required=false) Boolean recurrent) {
        return paginationService.clients(paginationService.pageable(page,size,sort,direction,
                Set.of("dateCreation","dateMiseAJour","nom","societe"),"dateMiseAJour"),search,actif,recurrent);
    }

    @GetMapping("/{id}")
    public ClientDetailDTO trouverClient(@PathVariable Long id) {
        return clientService.trouverClient(id);
    }
}
