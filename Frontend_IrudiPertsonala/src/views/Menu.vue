 <template>
  <div class="container mt-5">
    <div class="row g-4">
      <div class="col-md-6 col-lg-3">
        <menuBotoia
          Titulo="Hitzorduak"
          imagen="editatu"
          ruta="/hitzorduak"
        />
      </div>
      <div class="col-md-6 col-lg-3">
        <menuBotoia
          Titulo="Txandak"
          imagen="editatu"
          ruta="/txandak"
        />
      </div>
      <div class="col-md-6 col-lg-3">
        <menuBotoia
          Titulo="Mugimenduak"
          imagen="editatu"
          ruta="/mugimenduak"
        />
      </div>
      <div class="col-md-6 col-lg-3">
        <menuBotoia
          Titulo="Bezeroak"
          imagen="editatu"
          ruta="/bezeroak"
        />
      </div>
    </div>

    <div class="row g-3 mt-5">
      <div class="col-md-6">
        <div class="bg-primary p-3 rounded">
          <div class="text-center mb-3">
            <img src="@/assets/ezabatu.png" alt="Imagen 1" class="img-fluid rounded" style="width: 40px; height: 40px; object-fit: cover;" />
            <p class="text-white mt-2 mb-0 small">Inbentarioa</p>
          </div>
          <div class="row g-2">
            <div class="col-6">
              <menuBotoia
                Titulo="Materialak"
                imagen="editatu"
                ruta="/materialak"
              />
            </div>
            <div class="col-6">
              <menuBotoia
                Titulo="Produktuak"
                imagen="editatu"
                ruta="/produktuak"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="bg-primary p-3 rounded">
          <div class="text-center mb-3">
            <img src="@/assets/ezabatu.png" alt="Imagen 3" class="img-fluid rounded" style="width: 40px; height: 40px; object-fit: cover;" />
            <p class="text-white mt-2 mb-0 small">Kudeaketak</p>
          </div>
          <div class="row g-2">
            <div class="col-6">
              <menuBotoia
                Titulo="Ikasleak"
                imagen="editatu"
                ruta="/ikasleak"
              />
            </div>
            <div class="col-6">
              <menuBotoia
                Titulo="Zerbitzuak"
                imagen="editatu"
                ruta="/zerbitzuak"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import menuBotoia from "../components/menuBotoia.vue";
export default {
  components: {
    menuBotoia
  }
}
</script>